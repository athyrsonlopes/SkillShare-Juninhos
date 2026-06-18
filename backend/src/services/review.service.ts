import { Role } from "@prisma/client";
import prisma from "../lib/prisma";
import { conflict, forbidden, notFound } from "../lib/errors";
import { publicUserSelect } from "../lib/selects";
import { CreateReviewInput } from "../schemas/review.schema";

const reviewSelect = {
  id: true,
  sessionId: true,
  reviewerId: true,
  mentorId: true,
  rating: true,
  comment: true,
  createdAt: true,
  updatedAt: true,
  reviewer: {
    select: publicUserSelect,
  },
  mentor: {
    select: publicUserSelect,
  },
  session: {
    select: {
      id: true,
      status: true,
      startedAt: true,
      endedAt: true,
      durationMinutes: true,
      booking: {
        select: {
          id: true,
          skill: true,
          studentId: true,
          teacherId: true,
          student: { select: publicUserSelect },
          teacher: { select: publicUserSelect },
        },
      },
    },
  },
} as const;

async function loadSession(sessionId: string) {
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      status: true,
      booking: {
        select: {
          id: true,
          skill: true,
          status: true,
          studentId: true,
          teacherId: true,
          student: { select: publicUserSelect },
          teacher: { select: publicUserSelect },
        },
      },
    },
  });

  if (!session) {
    throw notFound("Sessão não encontrada");
  }

  return session;
}

async function refreshMentorRating(mentorId: string) {
  const aggregate = await prisma.review.aggregate({
    where: { mentorId },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.user.update({
    where: { id: mentorId },
    data: {
      avgRating: aggregate._avg.rating || 0,
      ratingsCount: aggregate._count.rating,
    },
  });
}

export async function submitReview(userId: string, role: Role, input: CreateReviewInput) {
  const session = await loadSession(input.sessionId);
  const booking = session.booking;

  if (role !== "ADMIN" && booking.studentId !== userId) {
    throw forbidden("Apenas o aluno pode avaliar esta sessão");
  }

  if (session.status !== "COMPLETED" || booking.status !== "COMPLETED") {
    throw conflict("Só é possível avaliar sessões concluídas");
  }

  const existing = await prisma.review.findUnique({
    where: {
      sessionId_reviewerId: {
        sessionId: input.sessionId,
        reviewerId: userId,
      },
    },
  });

  if (existing) {
    throw conflict("Já enviaste uma avaliação para esta sessão");
  }

  const review = await prisma.review.create({
    data: {
      sessionId: input.sessionId,
      reviewerId: userId,
      mentorId: booking.teacherId,
      rating: input.rating,
      comment: input.comment?.trim() || null,
    },
    select: reviewSelect,
  });

  await refreshMentorRating(booking.teacherId);

  return review;
}

export async function listMentorReviews(mentorId: string) {
  const mentor = await prisma.user.findUnique({
    where: { id: mentorId },
    select: {
      id: true,
      name: true,
      avatar: true,
      avgRating: true,
      ratingsCount: true,
      role: true,
    },
  });

  if (!mentor) {
    throw notFound("Mentor não encontrado");
  }

  const reviews = await prisma.review.findMany({
    where: { mentorId },
    select: reviewSelect,
    orderBy: { createdAt: "desc" },
  });

  return { mentor, reviews };
}
