import { SkillKind, SkillLevel } from "@prisma/client";
import prisma from "../lib/prisma";
import { notFound } from "../lib/errors";
import { publicUserSelect, fullProfileSelect } from "../lib/selects";
import { buildInitialsAvatar } from "../utils/avatars";
import { AvatarUploadInput, ProfileSkillInput, ProfileUpdateInput } from "../schemas/profile.schema";

const profileUserSelect = {
  ...publicUserSelect,
  profile: {
    select: {
      ...fullProfileSelect,
    },
  },
  skills: {
    select: {
      id: true,
      name: true,
      kind: true,
      level: true,
      createdAt: true,
      updatedAt: true,
    },
  },
} as const;

function normalizeSkillName(name: string) {
  return name.trim();
}

async function ensureProfile(userId: string) {
  const profile = await prisma.profile.findUnique({ where: { userId } });
  if (profile) {
    return profile;
  }

  return prisma.profile.create({
    data: { userId },
  });
}

async function replaceSkills(userId: string, skills: ProfileSkillInput[]) {
  const normalized = skills
    .map((skill) => ({
      name: normalizeSkillName(skill.name),
      kind: skill.kind as SkillKind,
      level: skill.level as SkillLevel,
    }))
    .filter((skill, index, items) => {
      const key = `${skill.kind}:${skill.name.toLowerCase()}`;
      return items.findIndex((item) => `${item.kind}:${item.name.toLowerCase()}` === key) === index;
    });

  await prisma.$transaction(async (tx) => {
    await tx.userSkill.deleteMany({ where: { userId } });

    if (normalized.length > 0) {
      await tx.userSkill.createMany({
        data: normalized.map((skill) => ({
          userId,
          ...skill,
        })),
      });
    }
  });
}

async function buildMatchHistory(userId: string) {
  const bookings = await prisma.booking.findMany({
    where: {
      OR: [{ studentId: userId }, { teacherId: userId }],
      status: {
        in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED", "PENDING"],
      },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
    include: {
      student: { select: publicUserSelect },
      teacher: { select: publicUserSelect },
    },
  });

  return bookings.map((booking) => {
    const counterpart = booking.studentId === userId ? booking.teacher : booking.student;
    return {
      id: booking.id,
      skill: booking.skill,
      status: booking.status,
      date: booking.scheduledFor || booking.confirmedAt || booking.createdAt,
      counterpart: {
        id: counterpart.id,
        name: counterpart.name,
        role: counterpart.role,
        avatar: counterpart.avatar,
      },
    };
  });
}

async function buildProfileResponse(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: profileUserSelect,
  });

  if (!user) {
    throw notFound("Utilizador não encontrado");
  }

  const matchHistory = await buildMatchHistory(userId);
  const { profile, skills, ...safeUser } = user;

  return {
    user: safeUser,
    profile: {
      ...(user.profile || {}),
      skills: user.skills,
      matchHistory,
    },
  };
}

export async function getProfile(userId: string) {
  await ensureProfile(userId);
  return buildProfileResponse(userId);
}

export async function getProfileById(_viewerId: string, targetUserId: string) {
  await ensureProfile(targetUserId);
  return buildProfileResponse(targetUserId);
}

export async function updateProfile(userId: string, data: ProfileUpdateInput) {
  await ensureProfile(userId);

  if (
    data.bio !== undefined ||
    data.studyPreferences !== undefined ||
    data.contentToStudy !== undefined ||
    data.contentToTeach !== undefined
  ) {
    await prisma.profile.update({
      where: { userId },
      data: {
        ...(data.bio !== undefined ? { bio: data.bio } : {}),
        ...(data.studyPreferences !== undefined ? { studyPreferences: data.studyPreferences } : {}),
        ...(data.contentToStudy !== undefined ? { contentToStudy: data.contentToStudy } : {}),
        ...(data.contentToTeach !== undefined ? { contentToTeach: data.contentToTeach } : {}),
      },
    });
  }

  if (data.name) {
    await prisma.user.update({
      where: { id: userId },
      data: { name: data.name },
    });
  }

  if (data.skills) {
    await replaceSkills(userId, data.skills);
  }

  return buildProfileResponse(userId);
}

export async function uploadAvatar(userId: string, data: AvatarUploadInput) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, avatar: true },
  });

  if (!user) {
    throw notFound("Utilizador não encontrado");
  }

  const avatar = data.avatar || buildInitialsAvatar(user.name, data.initials);

  await prisma.user.update({
    where: { id: userId },
    data: { avatar },
  });

  return buildProfileResponse(userId);
}

export async function recordSessionCompletion(studentId: string, teacherId: string) {
  const now = new Date();

  await prisma.profile.upsert({
    where: { userId: studentId },
    update: {
      lessonsStudied: {
        increment: 1,
      },
      matchCount: {
        increment: 1,
      },
      lastMatchAt: now,
    },
    create: {
      userId: studentId,
      lessonsStudied: 1,
      matchCount: 1,
      lastMatchAt: now,
    },
  });

  await prisma.profile.upsert({
    where: { userId: teacherId },
    update: {
      lessonsMentored: {
        increment: 1,
      },
      matchCount: {
        increment: 1,
      },
      lastMatchAt: now,
    },
    create: {
      userId: teacherId,
      lessonsMentored: 1,
      matchCount: 1,
      lastMatchAt: now,
    },
  });

  const [studentProgress, teacherProgress] = await Promise.all([
    recalculateProgress(studentId),
    recalculateProgress(teacherId),
  ]);

  return { studentProgress, teacherProgress };
}

export async function recalculateProgress(userId: string) {
  const since = new Date();
  since.setDate(since.getDate() - 28);

  const completed = await prisma.booking.count({
    where: {
      status: "COMPLETED",
      completedAt: { gte: since },
      OR: [{ studentId: userId }, { teacherId: userId }],
    },
  });

  const progress = Math.min(100, completed * 25);

  await prisma.profile.upsert({
    where: { userId },
    update: { progress },
    create: { userId, progress },
  });

  return progress;
}
