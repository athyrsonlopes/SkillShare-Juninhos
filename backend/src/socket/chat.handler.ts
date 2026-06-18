import { Server } from "socket.io";
import { extractBearerToken, resolveAuthenticatedPayload } from "../lib/auth-token";
import { emitToChannel } from "../lib/realtime";
import { createMessage, ensureChannelAccess } from "../services/chat.service";

type JoinChannelPayload = { channelId: string };
type SendMessagePayload = { channelId: string; body: string };
type TypingPayload = { channelId: string; isTyping?: boolean };

export function registerChatHandlers(io: Server) {
  io.use(async (socket, next) => {
    try {
      const token =
        extractBearerToken(socket.handshake.headers.authorization) ||
        (typeof socket.handshake.auth?.token === "string" ? socket.handshake.auth.token : null);

      if (!token) {
        next(new Error("Token não fornecido"));
        return;
      }

      socket.data.user = await resolveAuthenticatedPayload(token);
      next();
    } catch (error) {
      next(error instanceof Error ? error : new Error("Falha na autenticação do socket"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as { userId: string; role: string };

    socket.join(`user:${user.userId}`);

    socket.on("join_channel", async (payload: JoinChannelPayload, ack?: (response: any) => void) => {
      try {
        const channel = await ensureChannelAccess(payload.channelId, user.userId, socket.data.user.role);
        socket.join(`channel:${channel.id}`);
        ack?.({ ok: true, channelId: channel.id });
      } catch (error) {
        ack?.({ ok: false, error: error instanceof Error ? error.message : "Erro ao entrar no canal" });
      }
    });

    socket.on("send_message", async (payload: SendMessagePayload, ack?: (response: any) => void) => {
      try {
        const message = await createMessage(payload.channelId, user.userId, socket.data.user.role, payload.body);
        socket.to(`channel:${payload.channelId}`).emit("new_message", message);
        socket.emit("new_message", message);
        ack?.({ ok: true, message });
      } catch (error) {
        ack?.({ ok: false, error: error instanceof Error ? error.message : "Erro ao enviar mensagem" });
      }
    });

    socket.on("typing", async (payload: TypingPayload) => {
      try {
        await ensureChannelAccess(payload.channelId, user.userId, socket.data.user.role);
        socket.to(`channel:${payload.channelId}`).emit("typing_indicator", {
          channelId: payload.channelId,
          userId: user.userId,
          isTyping: payload.isTyping ?? true,
        });
      } catch {
        // ignore invalid typing events
      }
    });
  });
}
