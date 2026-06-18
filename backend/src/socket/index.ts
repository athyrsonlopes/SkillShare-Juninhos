import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../lib/env";
import { setRealtimeServer } from "../lib/realtime";
import { registerChatHandlers } from "./chat.handler";
import { notifyBookingConfirmed, notifyNewMatch, notifySessionStarted } from "./notification.handler";

export function initializeSocket(server: HttpServer) {
  const io = new Server(server, {
    cors: {
      origin: env.frontendUrl,
      credentials: true,
    },
  });

  setRealtimeServer(io);
  registerChatHandlers(io);

  return {
    io,
    notifyNewMatch,
    notifyBookingConfirmed,
    notifySessionStarted,
  };
}
