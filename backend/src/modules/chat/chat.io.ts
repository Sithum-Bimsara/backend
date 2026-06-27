import { Server as SocketIOServer } from "socket.io";

/**
 * Holds the Socket.io server instance so any module can emit without
 * creating a circular dependency between the gateway and the service.
 */
let _io: SocketIOServer | null = null;

export const setIO = (io: SocketIOServer) => {
  _io = io;
};

export const emitToRoom = (chatRoomId: string, event: string, data: unknown) => {
  if (_io) {
    _io.to(chatRoomId).emit(event, data);
  }
};

/**
 * Checks if a specific user is currently "active" in a room.
 * Useful for suppressing email notifications if they are already online.
 */
export const isUserInRoom = async (chatRoomId: string, userId: string): Promise<boolean> => {
  if (!_io) return false;
  const sockets = await _io.in(chatRoomId).fetchSockets();
  // Properly cast the remote socket to recognize our custom userId property
  return sockets.some((s) => (s as unknown as { userId: string }).userId === userId);
};

export const emitToUser = (userId: string, event: string, data: unknown) => {
  if (_io) {
    _io.to(`user:${userId}`).emit(event, data);
  }
};
