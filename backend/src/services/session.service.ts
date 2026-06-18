import { Role } from "@prisma/client";
import prisma from "../lib/prisma";
import { conflict, forbidden, notFound } from "../lib/errors";
import { env } from "../lib/env";
import { emitToUser } from "../lib/realtime";
import { sendSessionStartedEmail } from "./email.service";
import { recordSessionCompletion } from "./profile.service";

const sessionSelect = {
  id: true,
  bookingId: true,
  status: true,
  meetLink: true,
  startedAt: true,
  endedAt: true,
  durationMinutes: true,
  createdAt: true,
  updatedAt: true,
  booking: {
    select: {
      id: true,
      skill: true,
      status: true,
      scheduledFor: true,
      studentId: true,
      teacherId: true,
      student: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
        },
      },
      teacher: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          avatar: true,
        },
      },
    },
  },
} as const;

async function loadSession(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: sessionSelect,
  });

  if (!session) {
    throw notFound("Sessão não encontrada");
  }

  return session;
}

function buildMeetLink(sessionId: string) {
  return `${env.jitsiBaseUrl.replace(/\/$/, "")}/skillshare-${sessionId}`;
}

export async function startSession(userId: string, role: Role, sessionId: string) {
  const session = await loadSession(sessionId);
  const booking = session.booking;

  if (role !== "ADMIN" && booking.studentId !== userId && booking.teacherId !== userId) {
    throw forbidden("Sem permissão para iniciar esta sessão");
  }

  if (booking.status !== "CONFIRMED" && booking.status !== "IN_PROGRESS") {
    throw conflict("A sessão só pode começar depois do booking confirmado");
  }

  if (session.status === "COMPLETED" || session.status === "CANCELLED") {
    throw conflict("Sessão já terminou");
  }

  const meetLink = session.meetLink || buildMeetLink(session.id);
  const now = new Date();

  const updatedSession = await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: "IN_PROGRESS",
        meetLink,
      },
    });

    const updated = await tx.session.update({
      where: { id: session.id },
      data: {
        status: "IN_PROGRESS",
        startedAt: session.startedAt || now,
        meetLink,
      },
      select: sessionSelect,
    });

    return updated;
  });

  emitToUser(booking.studentId, "session_started", updatedSession);
  emitToUser(booking.teacherId, "session_started", updatedSession);

  void sendSessionStartedEmail(booking.student.email, booking.skill, meetLink);
  void sendSessionStartedEmail(booking.teacher.email, booking.skill, meetLink);

  return updatedSession;
}

export async function endSession(userId: string, role: Role, sessionId: string) {
  const session = await loadSession(sessionId);
  const booking = session.booking;

  if (role !== "ADMIN" && booking.studentId !== userId && booking.teacherId !== userId) {
    throw forbidden("Sem permissão para terminar esta sessão");
  }

  if (session.status === "COMPLETED" || session.status === "CANCELLED") {
    throw conflict("Sessão já terminou");
  }

  if (session.status !== "IN_PROGRESS") {
    throw conflict("A sessão precisa de ser iniciada antes de terminar");
  }

  const endedAt = new Date();
  const startedAt = session.startedAt || endedAt;
  const durationMinutes = Math.max(0, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000));

  const updatedSession = await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: booking.id },
      data: {
        status: "COMPLETED",
        completedAt: endedAt,
        durationMinutes,
      },
    });

    const updated = await tx.session.update({
      where: { id: session.id },
      data: {
        status: "COMPLETED",
        endedAt,
        durationMinutes,
      },
      select: sessionSelect,
    });

    return updated;
  });

  await recordSessionCompletion(booking.studentId, booking.teacherId);

  return updatedSession;
}

export async function listSessions(userId: string, role: Role) {
  return prisma.session.findMany({
    where: role === "ADMIN"
      ? {}
      : {
          OR: [
            {
              booking: {
                is: {
                  studentId: userId,
                },
              },
            },
            {
              booking: {
                is: {
                  teacherId: userId,
                },
              },
            },
          ],
        },
    select: sessionSelect,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });
}

export async function getSession(userId: string, role: Role, sessionId: string) {
  const session = await loadSession(sessionId);

  if (role !== "ADMIN" && session.booking.studentId !== userId && session.booking.teacherId !== userId) {
    throw forbidden("Sem permissão para ver esta sessão");
  }

  return session;
}
