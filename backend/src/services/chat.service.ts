import { Role } from "@prisma/client";
import prisma from "../lib/prisma";
import { badRequest, forbidden, notFound } from "../lib/errors";
import { publicUserSelect } from "../lib/selects";

const messageSelect = {
  id: true,
  channelId: true,
  senderId: true,
  body: true,
  createdAt: true,
  readAt: true,
  sender: {
    select: publicUserSelect,
  },
} as const;

async function loadChannel(channelId: string) {
  const channel = await prisma.chatChannel.findUnique({
    where: { id: channelId },
    select: {
      id: true,
      type: true,
      userAId: true,
      userBId: true,
      bookingId: true,
      openRequestId: true,
      friendshipId: true,
    },
  });

  if (!channel) {
    throw notFound("Canal não encontrado");
  }

  return channel;
}

export async function ensureChannelAccess(channelId: string, userId: string, role: Role) {
  const channel = await loadChannel(channelId);

  if (role !== "ADMIN" && channel.userAId !== userId && channel.userBId !== userId) {
    throw forbidden("Sem permissão para aceder a este canal");
  }

  return channel;
}

export async function getChannelMessages(channelId: string, userId: string, role: Role) {
  await ensureChannelAccess(channelId, userId, role);

  return prisma.chatMessage.findMany({
    where: { channelId },
    select: messageSelect,
    orderBy: { createdAt: "asc" },
  });
}

export async function createMessage(channelId: string, userId: string, role: Role, body: string) {
  await ensureChannelAccess(channelId, userId, role);

  const trimmed = body.trim();
  if (!trimmed) {
    throw badRequest("Mensagem não pode estar vazia");
  }

  const message = await prisma.chatMessage.create({
    data: {
      channelId,
      senderId: userId,
      body: trimmed,
    },
    select: messageSelect,
  });

  return message;
}

export async function getOrCreateDirectChannel(
  userAId: string,
  userBId: string,
  type: "FRIENDSHIP" | "BOOKING" | "OPEN_REQUEST",
  relationIds?: { bookingId?: string | null; openRequestId?: string | null; friendshipId?: string | null }
) {
  const [left, right] = [userAId, userBId].sort();

  const existing = await prisma.chatChannel.findFirst({
    where: {
      OR: [
        {
          userAId: left,
          userBId: right,
        },
        {
          userAId: right,
          userBId: left,
        },
      ],
      ...(relationIds?.bookingId ? { bookingId: relationIds.bookingId } : {}),
      ...(relationIds?.openRequestId ? { openRequestId: relationIds.openRequestId } : {}),
      ...(relationIds?.friendshipId ? { friendshipId: relationIds.friendshipId } : {}),
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.chatChannel.create({
    data: {
      type,
      userAId: left,
      userBId: right,
      ...(relationIds?.bookingId ? { bookingId: relationIds.bookingId } : {}),
      ...(relationIds?.openRequestId ? { openRequestId: relationIds.openRequestId } : {}),
      ...(relationIds?.friendshipId ? { friendshipId: relationIds.friendshipId } : {}),
    },
  });
}
