import { Role, SlotStatus } from "@prisma/client";
import prisma from "../lib/prisma";
import { conflict, forbidden, notFound } from "../lib/errors";
import { allowedSkillLevels } from "./matching.service";
import { normalizeSkillLevel } from "../utils/levels";
import { CreateSlotInput } from "../schemas/mentor.schema";
import { mentorSelect } from "../lib/selects";

const mentorWithSlotsSelect = {
  ...mentorSelect,
  mentorSlots: {
    select: {
      id: true,
      skill: true,
      level: true,
      startsAt: true,
      endsAt: true,
      status: true,
      notes: true,
      createdAt: true,
    },
    where: {
      status: "OPEN" as const,
    },
    orderBy: {
      startsAt: "asc" as const,
    },
  },
} as const;

export async function listMentors(currentUserId: string, skill?: string, level?: string) {
  const normalizedSkill = skill?.trim();
  const requiredLevel = level ? normalizeSkillLevel(level) : undefined;
  const levelFilter = requiredLevel ? allowedSkillLevels(requiredLevel) : undefined;

  const mentors = await prisma.user.findMany({
    where: {
      id: {
        not: currentUserId,
      },
      role: {
        in: ["PROFESSOR", "ADMIN"],
      },
      ...(normalizedSkill
        ? {
            skills: {
              some: {
                kind: "TEACH",
                name: {
                  equals: normalizedSkill,
                  mode: "insensitive",
                },
                ...(levelFilter ? { level: { in: levelFilter } } : {}),
              },
            },
          }
        : {}),
    },
    select: {
      ...mentorWithSlotsSelect,
      mentorSlots: {
        select: {
          id: true,
          skill: true,
          level: true,
          startsAt: true,
          endsAt: true,
          status: true,
          notes: true,
          createdAt: true,
        },
        where: {
          status: "OPEN",
          ...(normalizedSkill
            ? {
                skill: {
                  equals: normalizedSkill,
                  mode: "insensitive",
                },
                ...(levelFilter ? { level: { in: levelFilter } } : {}),
              }
            : {}),
        },
        orderBy: {
          startsAt: "asc",
        },
      },
    },
    orderBy: [{ avgRating: "desc" }, { ratingsCount: "desc" }, { createdAt: "asc" }],
  });

  return mentors.map((mentor) => ({
    ...mentor,
    availableSlotsCount: mentor.mentorSlots.length,
  }));
}

export async function getMentorSlots(mentorId: string) {
  const mentor = await prisma.user.findUnique({
    where: { id: mentorId },
    select: {
      id: true,
      name: true,
      role: true,
      avatar: true,
      avgRating: true,
      ratingsCount: true,
    },
  });

  if (!mentor) {
    throw notFound("Mentor não encontrado");
  }

  const slots = await prisma.availabilitySlot.findMany({
    where: {
      mentorId,
      status: "OPEN",
    },
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      skill: true,
      level: true,
      startsAt: true,
      endsAt: true,
      status: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return { mentor, slots };
}

export async function createSlot(userId: string, role: Role, input: CreateSlotInput) {
  if (role === "USER") {
    throw forbidden("Apenas professores podem criar slots");
  }

  const overlap = await prisma.availabilitySlot.findFirst({
    where: {
      mentorId: userId,
      status: {
        in: ["OPEN", "RESERVED", "BOOKED"],
      },
      startsAt: {
        lt: input.endsAt,
      },
      endsAt: {
        gt: input.startsAt,
      },
    },
  });

  if (overlap) {
    throw conflict("Já existe um slot sobreposto neste período");
  }

  return prisma.availabilitySlot.create({
    data: {
      mentorId: userId,
      skill: input.skill.trim(),
      level: input.level,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      notes: input.notes?.trim() || null,
    },
  });
}

export async function deleteSlot(userId: string, role: Role, slotId: string) {
  const slot = await prisma.availabilitySlot.findUnique({
    where: { id: slotId },
  });

  if (!slot) {
    throw notFound("Slot não encontrado");
  }

  if (role !== "ADMIN" && slot.mentorId !== userId) {
    throw forbidden("Sem permissão para remover este slot");
  }

  if (slot.bookingId) {
    throw conflict("Slot já está reservado");
  }

  await prisma.availabilitySlot.delete({
    where: { id: slotId },
  });

  return { message: "Slot removido" };
}
