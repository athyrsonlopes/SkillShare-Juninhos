import { Server } from "socket.io";

let io: Server | null = null;

export function setRealtimeServer(server: Server) {
  io = server;
  return server;
}

export function getRealtimeServer() {
  return io;
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  io?.to(`user:${userId}`).emit(event, payload);
}

export function emitToChannel(channelId: string, event: string, payload: unknown) {
  io?.to(`channel:${channelId}`).emit(event, payload);
}
