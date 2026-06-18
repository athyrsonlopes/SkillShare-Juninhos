import { ChannelType, OpenRequestStatus, Role } from "@prisma/client";
import prisma from "../lib/prisma";
import { conflict, forbidden, notFound } from "../lib/errors";
import { publicUserSelect } from "../lib/selects";
import { emitToUser } from "../lib/realtime";
import { sendBookingConfirmedEmail } from "./email.service";
import { CreateOpenRequestInput } from "../schemas/openRequest.schema";
import { getCompatibleOpenRequests, hasCompatibleSkill, allowedSkillLevels } from "./matching.service";
import { loadBookingPublic } from "./booking.service";

const openRequestSelect = {
  id: true,
  creatorId: true,
  skill: true,
  level: true,
  preferredDate: true,
  notes: true,
  status: true,
  matchedById: true,
  matchedAt: true,
  createdAt: true,
  updatedAt: true,
  creator: {
    select: publicUserSelect,
  },
  matchedBy: {
    select: publicUserSelect,
  },
  booking: {
    select: {
      id: true,
      status: true,
      scheduledFor: true,
      teacherId: true,
      studentId: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  chatChannel: {
    select: {
      id: true,
      type: true,
      userAId: true,
      userBId: true,
    },
  },
} as const;

async function loadRequest(requestId: string) {
  const request = await prisma.openRequest.findUnique({
    where: { id: requestId },
    select: openRequestSelect,
  });

  if (!request) {
    throw notFound("Pedido aberto não encontrado");
  }

  return request;
}

export async function createOpenRequest(userId: string, input: CreateOpenRequestInput) {
  const request = await prisma.openRequest.create({
    data: {
      creatorId: userId,
      skill: input.skill.trim(),
      level: input.level,
      preferredDate: input.preferredDate || null,
      notes: input.notes?.trim() || null,
      status: "OPEN",
    },
    select: openRequestSelect,
  });

  return request;
}

export async function listCompatibleFeed(userId: string) {
  return getCompatibleOpenRequests(userId);
}

export async function listMine(userId: string) {
  return prisma.openRequest.findMany({
    where: { creatorId: userId },
    select: openRequestSelect,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function matchOpenRequest(userId: string, role: Role, requestId: string) {
  const request = await loadRequest(requestId);

  if (request.status !== "OPEN") {
    throw conflict("Pedido aberto já foi processado");
  }

  if (request.creatorId === userId) {
    throw conflict("Não podes dar match no teu próprio pedido");
  }

  const compatible = await hasCompatibleSkill(userId, request.skill, request.level);
  if (!compatible) {
    throw forbidden("Não tens compatibilidade suficiente para este pedido");
  }

  const matcher = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
    },
  });

  const creator = await prisma.user.findUnique({
    where: { id: request.creatorId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
    },
  });

  if (!matcher || !creator) {
    throw notFound("Utilizador envolvido não encontrado");
  }

  const booking = await prisma.$transaction(async (tx) => {
    const created = await tx.booking.create({
      data: {
        studentId: request.creatorId,
        teacherId: userId,
        skill: request.skill,
        notes: request.notes,
        status: "CONFIRMED",
        scheduledFor: request.preferredDate || null,
        confirmedAt: new Date(),
        openRequestId: request.id,
      },
    });

    await tx.openRequest.update({
      where: { id: request.id },
      data: {
        status: "MATCHED",
        matchedById: userId,
        matchedAt: new Date(),
      },
    });

    await tx.chatChannel.create({
      data: {
        type: "OPEN_REQUEST",
        userAId: request.creatorId,
        userBId: userId,
        bookingId: created.id,
        openRequestId: request.id,
      },
    });

    await tx.session.create({
      data: {
        bookingId: created.id,
        status: "SCHEDULED",
      },
    });

    return created;
  });

  const fullBooking = await loadBookingPublic(booking.id);

  emitToUser(request.creatorId, "new_match", {
    openRequestId: request.id,
    booking: fullBooking,
  });
  emitToUser(request.creatorId, "booking_confirmed", fullBooking);
  emitToUser(userId, "booking_confirmed", fullBooking);

  void sendBookingConfirmedEmail(creator.email, matcher.name, request.skill, fullBooking.meetLink);
  void sendBookingConfirmedEmail(matcher.email, creator.name, request.skill, fullBooking.meetLink);

  return {
    requestId: request.id,
    booking: fullBooking,
  };
}

export async function cancelOpenRequest(userId: string, role: Role, requestId: string) {
  const request = await loadRequest(requestId);

  if (role !== "ADMIN" && request.creatorId !== userId) {
    throw forbidden("Sem permissão para cancelar este pedido");
  }

  if (request.status === "CANCELLED") {
    return request;
  }

  await prisma.$transaction(async (tx) => {
    await tx.openRequest.update({
      where: { id: requestId },
      data: {
        status: "CANCELLED",
      },
    });

    if (request.booking?.id) {
      await tx.booking.update({
        where: { id: request.booking.id },
        data: {
          status: "CANCELLED",
          cancelledAt: new Date(),
        },
      });

      await tx.session.updateMany({
        where: { bookingId: request.booking.id },
        data: {
          status: "CANCELLED",
        },
      });
    }
  });

  return loadRequest(requestId);
}
