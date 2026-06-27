import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { supabase } from "../../config/supabase";
import * as chatRepository from "./chat.repository";
import { prisma } from "../../config/prisma";
import { setIO } from "./chat.io";
import { cancelChatNotification } from "../../queues/notificationQueue";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  isAdmin?: boolean;
}

export const initChatGateway = (httpServer: HttpServer) => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "https://meetmemaldives.com",
        "https://www.meetmemaldives.com",
        "http://178.128.43.136",
      ],
      credentials: true,
    },
    path: "/socket.io",
  });

  // Register with the shared io holder (used by chat.service to emit)
  setIO(io);

  // ─── Auth middleware ─────────────────────────────────────────────────────
  // The browser sends the httpOnly `access_token` cookie automatically
  // on the WebSocket upgrade request because the client uses withCredentials.
  // We read it from handshake.headers.cookie and verify via Supabase.
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      // Parse cookies from the upgrade request headers
      const cookieHeader = socket.handshake.headers?.cookie || "";
      const cookies = Object.fromEntries(
        cookieHeader.split(";").map((c) => {
          const eqIdx = c.indexOf("=");
          const key = c.slice(0, eqIdx).trim();
          const val = c.slice(eqIdx + 1).trim();
          return [key, val];
        })
      );

      const token = cookies["access_token"];

      if (!token) {
        console.warn("[Socket.io] Auth rejected: no access_token cookie");
        return next(new Error("Authentication error: no token"));
      }

      // Verify via Supabase (same as REST middleware)
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data?.user) {
        console.warn("[Socket.io] Auth rejected: Supabase verification failed", error?.message);
        return next(new Error("Authentication error: invalid token"));
      }

      // Fetch user role from DB
      const user = await prisma.user.findUnique({
        where: { id: data.user.id },
        select: { isAdmin: true }
      });

      socket.userId = data.user.id;
      socket.isAdmin = !!user?.isAdmin;
      next();
    } catch (err) {
      console.error("[Socket.io] Auth middleware error:", err);
      next(new Error("Authentication error"));
    }
  });

  // ─── Connection handler ──────────────────────────────────────────────────
  io.on("connection", (socket: AuthenticatedSocket) => {
    // userId is guaranteed by the auth middleware above
    const userId = socket.userId as string;
    console.log(`[Socket.io] User connected: ${userId} (${socket.id})`);

    // Join a personal room to receive targeted events (sidebar updates, etc)
    socket.join(`user:${userId}`);

    // ── join_room ──────────────────────────────────────────────────────────
    socket.on("join_room", async (chatRoomId: string) => {
      try {
        const chat = await chatRepository.findChatById(chatRoomId, userId);

        // Allow if user is member OR user is admin
        if (!chat && !socket.isAdmin) {
          socket.emit("error", { message: "Room not found or access denied" });
          return;
        }
        socket.join(chatRoomId);
        console.log(`[Socket.io] ${userId} joined room ${chatRoomId} (isAdmin: ${socket.isAdmin})`);
        socket.emit("joined_room", { chatRoomId });

        // ── Cancel pending email notifications ──────────────────────────────
        const userMember = chat?.members.find(m => m.userId === userId);
        if (userMember?.user?.email) {
          await cancelChatNotification(chatRoomId, userMember.user.email);
        }

        // Notify others that this user is now online in this room
        socket.to(chatRoomId).emit("user_presence", { userId, status: "online" });

        // Tell the joining user who else is ALREADY online in this room
        const roomSockets = await io.in(chatRoomId).fetchSockets();
        const onlineUserIds = Array.from(
          new Set(
            roomSockets
              .map(s => (s as unknown as { userId: string }).userId)
              .filter(id => !!id)
          )
        );
        socket.emit("room_presence", { chatRoomId, onlineUserIds });

        // DEBUG: Log online status
        console.log(`[Socket.io] Room ${chatRoomId} Online Users:`, onlineUserIds);
      } catch (err) {
        console.error("[Socket.io] join_room error:", err);
        socket.emit("error", { message: "Failed to join room" });
      }
    });

    // ── leave_room ─────────────────────────────────────────────────────────
    socket.on("leave_room", (chatRoomId: string) => {
      console.log(`[Socket.io] ${userId} leaving room ${chatRoomId}`);

      // Notify others that this user is now offline in this room BEFORE leaving
      socket.to(chatRoomId).emit("user_presence", { userId, status: "offline" });

      socket.leave(chatRoomId);

      // DEBUG: Re-fetch online users to verify
      (async () => {
        const roomSockets = await io.in(chatRoomId).fetchSockets();
        const onlineUserIds = Array.from(
          new Set(
            roomSockets
              .map(s => (s as unknown as { userId: string }).userId)
              .filter(id => !!id)
          )
        );
        console.log(`[Socket.io] Room ${chatRoomId} remaining users:`, onlineUserIds);
      })();
    });

    // ── send_message ───────────────────────────────────────────────────────
    socket.on("send_message", async (data: { chatRoomId: string; content: string }) => {
      try {
        const { chatRoomId, content } = data;
        if (!chatRoomId || !content?.trim()) return;

        const chatService = await import("./chat.service");
        await chatService.sendMessage(chatRoomId, userId, content);
      } catch (err) {
        const error = err as Error;
        console.error("[Socket.io] send_message error:", error);
        socket.emit("error", { message: error.message || "Failed to send message" });
      }
    });

    // ── typing indicator ───────────────────────────────────────────────────
    socket.on("typing", (data: { chatRoomId: string; isTyping: boolean }) => {
      socket.to(data.chatRoomId).emit("user_typing", {
        userId,
        isTyping: data.isTyping,
        chatRoomId: data.chatRoomId,
      });
    });

    // ── disconnecting ──────────────────────────────────────────────────────
    socket.on("disconnecting", () => {
      for (const room of socket.rooms) {
        if (room !== socket.id) {
          socket.to(room).emit("user_presence", { userId, status: "offline" });
        }
      }
    });

    // ── disconnect ─────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`[Socket.io] User disconnected: ${userId} (${socket.id})`);
    });
  });

  console.log("[Socket.io] Chat gateway initialized");
  return io;
};
