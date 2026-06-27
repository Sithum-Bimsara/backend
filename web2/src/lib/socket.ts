import { io, Socket } from "socket.io-client";


// Derive the Socket.IO server origin from the API base URL:
//   - Absolute URL (e.g. "https://lushware.com/api") → strip "/api" → "https://lushware.com"
//   - Relative URL  (e.g. "/api")                     → use window.location.origin
//   - Undefined (local dev fallback)                  → "http://localhost:3000"
const _apiBase = import.meta.env.VITE_PUBLIC_API_BASE_URL_for_WS as string | undefined;
const SOCKET_URL = _apiBase
  ? _apiBase.startsWith("/")
    ? window.location.origin                        // relative → same host
    : _apiBase.replace(/\/api\/?$/, "")             // absolute → strip /api
  : "http://localhost:3000";                        // local dev fallback


let socket: Socket | null = null;

/**
 * Returns a singleton Socket.io client.
 * Auth is handled purely via the httpOnly `access_token` cookie —
 * the browser sends it automatically on the WebSocket upgrade request
 * because `withCredentials: true` is set.
 * We do NOT try to read it via document.cookie (it's httpOnly).
 */
export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      path: "/socket.io",
      withCredentials: true,   // sends the access_token httpOnly cookie automatically
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("[Socket.io] Connected:", socket!.id);
    });

    socket.on("connect_error", (err) => {
      console.error("[Socket.io] Connection error:", err.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket.io] Disconnected:", reason);
    });
  }

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
