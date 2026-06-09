import prisma from "../lib/prisma";
import { AuthRequest } from "../types";

export async function getProfile(userId: string) {
  const profile = await prisma.profile.findUnique({
    where: { userId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          createdAt: true,
        },
      },
    },
  });

  if (!profile) {
    throw new Error("Perfil não encontrado");
  }

  return profile;
}

export async function updateProfile(userId: string, data: any) {
  const profile = await prisma.profile.update({
    where: { userId },
    data,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
        },
      },
    },
  });

  return profile;
}

export async function updateUser(userId: string, data: { name?: string; avatar?: string }) {
  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
    },
  });

  return user;
}
