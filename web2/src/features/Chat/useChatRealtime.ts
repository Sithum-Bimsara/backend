import { useEffect, useRef } from "react";
import { getSocket } from "../../lib/socket";

import type { IMessage, IViewTypingEvent } from "./types/chat.types";

/**
 * Connects to a Socket.io chat room and calls `onNewMessage` whenever a new
 * message is broadcast to that room. Also handles typing indicator events.
 */
export const useChatRealtime = (
  chatRoomId: string,
  onNewMessage: (msg: IMessage & { chatRoomId: string }) => void,
  onUserTyping?: (data: IViewTypingEvent) => void,
  onMessagesRead?: (data: { userId: string; messageIds: string[] }) => void,
  onPresenceUpdate?: (data: { userId: string; status: "online" | "offline" }) => void,
  onRoomPresence?: (data: { onlineUserIds: string[] }) => void
) => {
  // Keep a stable ref to the callbacks so we don't re-register listeners
  const onNewMessageRef = useRef(onNewMessage);
  const onUserTypingRef = useRef(onUserTyping);
  const onMessagesReadRef = useRef(onMessagesRead);
  const onPresenceUpdateRef = useRef(onPresenceUpdate);
  const onRoomPresenceRef = useRef(onRoomPresence);
  onNewMessageRef.current = onNewMessage;
  onUserTypingRef.current = onUserTyping;
  onMessagesReadRef.current = onMessagesRead;
  onPresenceUpdateRef.current = onPresenceUpdate;
  onRoomPresenceRef.current = onRoomPresence;

  useEffect(() => {
    if (!chatRoomId) return;

    const socket = getSocket();

    const handleNewMessage = (msg: IMessage & { chatRoomId: string }) => {
      onNewMessageRef.current(msg);
    };

    const handleTyping = (data: IViewTypingEvent) => {
      onUserTypingRef.current?.(data);
    };

    const handleRead = (data: { userId: string; messageIds: string[] }) => {
      onMessagesReadRef.current?.(data);
    };

    const handlePresence = (data: { userId: string; status: "online" | "offline" }) => {
      console.log(`[Presence] User ${data.userId} is now ${data.status}`);
      onPresenceUpdateRef.current?.(data);
    };

    const handleRoomPresence = (data: { onlineUserIds: string[] }) => {
      console.log(`[Presence] Current online users in room:`, data.onlineUserIds);
      onRoomPresenceRef.current?.(data);
    };

    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleTyping);
    socket.on("messages_read", handleRead);
    socket.on("user_presence", handlePresence);
    socket.on("room_presence", handleRoomPresence);

    // Join the room AFTER setting up listeners to avoid missing initial events (room_presence)
    socket.emit("join_room", chatRoomId);

    return () => {
      console.log(`[useChatRealtime] Cleaning up room: ${chatRoomId}`);
      socket.emit("leave_room", chatRoomId);
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleTyping);
      socket.off("messages_read", handleRead);
      socket.off("user_presence", handlePresence);
      socket.off("room_presence", handleRoomPresence);
    };
  }, [chatRoomId]);
};

/** Emit a typing indicator for the current room */
export const emitTyping = (chatRoomId: string, isTyping: boolean) => {
  const socket = getSocket();
  socket.emit("typing", { chatRoomId, isTyping });
};
