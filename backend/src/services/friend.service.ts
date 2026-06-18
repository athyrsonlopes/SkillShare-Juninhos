import prisma from "../lib/prisma";
import { conflict, forbidden, notFound } from "../lib/errors";
import { publicUserSelect } from "../lib/selects";
import { getOrCreateDirectChannel } from "./chat.service";

const friendSelect = {
  id: true,
  userAId: true,
  userBId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  userA: { select: publicUserSelect },
  userB: { select: publicUserSelect },
  channel: {
    select: {
      id: true,
      type: true,
      bookingId: true,
      openRequestId: true,
      friendshipId: true,
      createdAt: true,
      updatedAt: true,
      messages: {
        orderBy: { createdAt: "desc" as const },
        take: 1,
        select: {
          id: true,
          body: true,
          createdAt: true,
          sender: { select: publicUserSelect },
        },
      },
    },
  },
} as const;

function pair(userId: string, friendId: string) {
  return [userId, friendId].sort() as [string, string];
}

async function loadFriendship(userId: string, friendId: string) {
  const [userAId, userBId] = pair(userId, friendId);
  const friendship = await prisma.friendship.findUnique({
    where: {
      userAId_userBId: {
        userAId,
        userBId,
      },
    },
    select: friendSelect,
  });

  if (!friendship) {
    throw notFound("Amizade não encontrada");
  }

  return friendship;
}

export async function addFriend(userId: string, friendId: string) {
  if (userId === friendId) {
    throw conflict("Não podes adicionar-te a ti próprio");
  }

  const friend = await prisma.user.findUnique({
    where: { id: friendId },
    select: publicUserSelect,
  });

  if (!friend) {
    throw notFound("Utilizador não encontrado");
  }

  const [userAId, userBId] = pair(userId, friendId);

  const existing = await prisma.friendship.findUnique({
    where: {
      userAId_userBId: {
        userAId,
        userBId,
      },
    },
    select: friendSelect,
  });

  if (existing) {
    if (!existing.channel) {
      await prisma.chatChannel.create({
        data: {
          type: "FRIENDSHIP",
          userAId,
          userBId,
          friendshipId: existing.id,
        },
      });

      return loadFriendship(userId, friendId);
    }

    return existing;
  }

  const friendship = await prisma.$transaction(async (tx) => {
    const created = await tx.friendship.create({
      data: {
        userAId,
        userBId,
      },
    });

    await tx.chatChannel.create({
      data: {
        type: "FRIENDSHIP",
        userAId,
        userBId,
        friendshipId: created.id,
      },
    });

    return created;
  });

  return loadFriendship(userId, friendId);
}

export async function listFriends(userId: string) {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ userAId: userId }, { userBId: userId }],
    },
    select: friendSelect,
    orderBy: { updatedAt: "desc" },
  });

  return friendships.map((friendship) => {
    const friend = friendship.userAId === userId ? friendship.userB : friendship.userA;
    return {
      ...friendship,
      friend,
    };
  });
}

export async function removeFriend(userId: string, friendId: string) {
  const [userAId, userBId] = pair(userId, friendId);
  const friendship = await prisma.friendship.findUnique({
    where: {
      userAId_userBId: {
        userAId,
        userBId,
      },
    },
  });

  if (!friendship) {
    throw notFound("Amizade não encontrada");
  }

  if (friendship.userAId !== userId && friendship.userBId !== userId) {
    throw forbidden("Sem permissão para remover esta amizade");
  }

  await prisma.friendship.delete({
    where: {
      userAId_userBId: {
        userAId,
        userBId,
      },
    },
  });

  return { message: "Amizade removida" };
}

export async function getFriendChannel(userId: string, friendId: string) {
  const friendship = await loadFriendship(userId, friendId);
  return friendship.channel;
}
