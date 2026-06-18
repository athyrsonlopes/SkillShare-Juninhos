import { Prisma, SkillLevel } from "@prisma/client";
import prisma from "../lib/prisma";
import { normalizeSkillLevel, skillLevelAtLeast } from "../utils/levels";

export function allowedSkillLevels(required: SkillLevel) {
  const order: SkillLevel[] = ["INICIANTE", "INTERMEDIARIO", "AVANCADO"];
  const index = order.indexOf(required);
  return index >= 0 ? order.slice(index) : order;
}

export function skillMatchesLevel(userLevel: SkillLevel, requiredLevel: SkillLevel) {
  return skillLevelAtLeast(userLevel, requiredLevel);
}

export async function hasCompatibleSkill(userId: string, skill: string, level: string) {
  const requiredLevel = normalizeSkillLevel(level);
  const compatibleLevels = allowedSkillLevels(requiredLevel);
  const normalizedSkill = skill.trim();

  const match = await prisma.userSkill.findFirst({
    where: {
      userId,
      name: {
        equals: normalizedSkill,
        mode: "insensitive",
      },
      level: {
        in: compatibleLevels,
      },
    },
  });

  return Boolean(match);
}

export async function buildCompatibleOpenRequestWhere(userId: string) {
  const skills = await prisma.userSkill.findMany({
    where: { userId },
    select: { name: true, level: true },
  });

  if (skills.length === 0) {
    return {
      id: { in: [] },
    } as Prisma.OpenRequestWhereInput;
  }

  return {
    status: "OPEN",
    creatorId: {
      not: userId,
    },
    OR: skills.map((skill) => ({
      skill: {
        equals: skill.name,
        mode: "insensitive" as const,
      },
      level: {
        in: allowedSkillLevels(skill.level),
      },
    })),
  } as Prisma.OpenRequestWhereInput;
}

export async function getCompatibleOpenRequests(userId: string) {
  const where = await buildCompatibleOpenRequestWhere(userId);

  return prisma.openRequest.findMany({
    where,
    include: {
      creator: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
          avgRating: true,
          ratingsCount: true,
        },
      },
      booking: {
        select: {
          id: true,
          status: true,
          scheduledFor: true,
          teacherId: true,
          studentId: true,
        },
      },
    },
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}
