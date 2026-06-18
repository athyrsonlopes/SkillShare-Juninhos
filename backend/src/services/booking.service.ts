import { BookingStatus, ChannelType, Role, SessionStatus, SlotStatus } from "@prisma/client";
import prisma from "../lib/prisma";
import { conflict, forbidden, notFound } from "../lib/errors";
import { publicUserSelect } from "../lib/selects";
import { emitToUser, emitToChannel } from "../lib/realtime";
import { sendBookingConfirmedEmail, sendBookingRequestedEmail } from "./email.service";
import { CreateBookingInput, ScheduleBookingInput } from "../schemas/booking.schema";

const bookingSelect = {
  id: true,
  studentId: true,
  teacherId: true,
  slotId: true,
  openRequestId: true,
  skill: true,
  notes: true,
  status: true,
  scheduledFor: true,
  meetLink: true,
  confirmedAt: true,
  cancelledAt: true,
  completedAt: true,
  durationMinutes: true,
  reminder24hSentAt: true,
  reminder1hSentAt: true,
  reviewReminderSentAt: true,
  createdAt: true,
  updatedAt: true,
  student: {
    select: publicUserSelect,
  },
  teacher: {
    select: publicUserSelect,
  },
  slot: {
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
  },
  openRequest: {
    select: {
      id: true,
      skill: true,
      level: true,
      preferredDate: true,
      notes: true,
      status: true,
      matchedById: true,
      matchedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  session: {
    select: {
      id: true,
      status: true,
      meetLink: true,
      startedAt: true,
      endedAt: true,
      durationMinutes: true,
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
      createdAt: true,
      updatedAt: true,
    },
  },
} as const;

async function loadBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: bookingSelect,
  });

  if (!booking) {
    throw notFound("Booking não encontrado");
  }

  return booking;
}

async function ensureSession(bookingId: string) {
  return prisma.session.upsert({
    where: { bookingId },
    update: {},
    create: {
      bookingId,
      status: "SCHEDULED",
    },
    select: {
      id: true,
      bookingId: true,
      status: true,
      meetLink: true,
      startedAt: true,
      endedAt: true,
      durationMinutes: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

async function ensureChannel(bookingId: string, studentId: string, teacherId: string, type: ChannelType) {
  const existing = await prisma.chatChannel.findFirst({
    where: {
      bookingId,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.chatChannel.create({
    data: {
      type,
      userAId: studentId,
      userBId: teacherId,
      bookingId,
    },
  });
}

async function releaseSlot(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { slotId: true },
  });

  if (!booking?.slotId) {
    return;
  }

  await prisma.$transaction([
    prisma.availabilitySlot.updateMany({
      where: { bookingId },
      data: {
        status: "OPEN",
        bookingId: null,
      },
    }),
    prisma.booking.update({
      where: { id: bookingId },
      data: { slotId: null },
    }),
  ]);
}

async function normalizeBookingForResponse(bookingId: string) {
  return loadBooking(bookingId);
}

export async function listBookings(userId: string, role: Role) {
  const bookings = await prisma.booking.findMany({
    where: role === "ADMIN" ? {} : { OR: [{ studentId: userId }, { teacherId: userId }] },
    select: bookingSelect,
    orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
  });

  return bookings;
}

export async function getBooking(userId: string, role: Role, bookingId: string) {
  const booking = await loadBooking(bookingId);

  if (role !== "ADMIN" && booking.studentId !== userId && booking.teacherId !== userId) {
    throw forbidden("Sem permissão para ver este booking");
  }

  return booking;
}

export async function createDirectBooking(userId: string, input: CreateBookingInput) {
  if (input.teacherId === userId) {
    throw conflict("Não podes marcar uma aula contigo próprio");
  }

  const slot = await prisma.availabilitySlot.findUnique({
    where: { id: input.slotId },
  });

  if (!slot) {
    throw notFound("Slot não encontrado");
  }

  if (slot.mentorId !== input.teacherId) {
    throw conflict("O slot não pertence ao professor selecionado");
  }

  if (slot.status !== "OPEN") {
    throw conflict("Slot indisponível");
  }

  const teacher = await prisma.user.findUnique({
    where: { id: input.teacherId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
    },
  });

  const student = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
    },
  });

  if (!teacher) {
    throw notFound("Professor não encontrado");
  }

  if (!student) {
    throw notFound("Aluno não encontrado");
  }

  const booking = await prisma.$transaction(async (tx) => {
    const created = await tx.booking.create({
      data: {
        studentId: userId,
        teacherId: input.teacherId,
        slotId: slot.id,
        skill: input.skill.trim(),
        notes: input.notes?.trim() || null,
        status: "PENDING",
        scheduledFor: slot.startsAt,
      },
    });

    await tx.availabilitySlot.update({
      where: { id: slot.id },
      data: {
        status: "RESERVED",
        bookingId: created.id,
      },
    });

    await tx.chatChannel.create({
      data: {
        type: "BOOKING",
        userAId: userId,
        userBId: input.teacherId,
        bookingId: created.id,
      },
    });

    return created;
  });

  const fullBooking = await normalizeBookingForResponse(booking.id);
  void sendBookingRequestedEmail(teacher.email, student.name, input.skill);
  emitToUser(input.teacherId, "booking_requested", fullBooking);

  return fullBooking;
}

export async function createConfirmedBooking(params: {
  studentId: string;
  teacherId: string;
  skill: string;
  notes?: string | null;
  scheduledFor?: Date | null;
  openRequestId?: string | null;
  type?: ChannelType;
}) {
  const booking = await prisma.$transaction(async (tx) => {
    const created = await tx.booking.create({
      data: {
        studentId: params.studentId,
        teacherId: params.teacherId,
        skill: params.skill.trim(),
        notes: params.notes?.trim() || null,
        status: "CONFIRMED",
        scheduledFor: params.scheduledFor || null,
        confirmedAt: new Date(),
        openRequestId: params.openRequestId || null,
      },
    });

    await tx.chatChannel.create({
      data: {
        type: params.type || "OPEN_REQUEST",
        userAId: params.studentId,
        userBId: params.teacherId,
        bookingId: created.id,
        openRequestId: params.openRequestId || null,
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

  return normalizeBookingForResponse(booking.id);
}

export async function scheduleBooking(userId: string, role: Role, bookingId: string, input: ScheduleBookingInput) {
  const booking = await loadBooking(bookingId);

  if (role !== "ADMIN" && booking.studentId !== userId && booking.teacherId !== userId) {
    throw forbidden("Sem permissão para atualizar este booking");
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      scheduledFor: input.scheduledFor,
    },
  });

  return normalizeBookingForResponse(updated.id);
}

export async function confirmBooking(userId: string, role: Role, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      studentId: true,
      teacherId: true,
      status: true,
      slotId: true,
      skill: true,
      scheduledFor: true,
      teacher: { select: publicUserSelect },
      student: { select: publicUserSelect },
      chatChannel: { select: { id: true, type: true } },
    },
  });

  if (!booking) {
    throw notFound("Booking não encontrado");
  }

  if (role !== "ADMIN" && booking.teacherId !== userId) {
    throw forbidden("Apenas o professor pode confirmar");
  }

  if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
    throw conflict("Booking já terminou");
  }

  if (booking.status === "CONFIRMED") {
    await ensureSession(booking.id);
    return normalizeBookingForResponse(booking.id);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const current = await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
      },
    });

    if (booking.slotId) {
      await tx.availabilitySlot.update({
        where: { id: booking.slotId },
        data: { status: "BOOKED" },
      });
    }

    await tx.session.upsert({
      where: { bookingId: booking.id },
      update: { status: "SCHEDULED" },
      create: {
        bookingId: booking.id,
        status: "SCHEDULED",
      },
    });

    return current;
  });

  const fullBooking = await normalizeBookingForResponse(updated.id);

  void sendBookingConfirmedEmail(booking.student.email, booking.teacher.name, booking.skill, fullBooking.meetLink);
  void sendBookingConfirmedEmail(booking.teacher.email, booking.student.name, booking.skill, fullBooking.meetLink);
  emitToUser(booking.studentId, "booking_confirmed", fullBooking);
  emitToUser(booking.teacherId, "booking_confirmed", fullBooking);

  return fullBooking;
}

export async function cancelBooking(userId: string, role: Role, bookingId: string) {
  const booking = await loadBooking(bookingId);

  if (role !== "ADMIN" && booking.studentId !== userId && booking.teacherId !== userId) {
    throw forbidden("Sem permissão para cancelar este booking");
  }

  if (booking.status === "COMPLETED") {
    throw conflict("Booking já foi concluído");
  }

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    if (booking.slotId) {
      await tx.availabilitySlot.update({
        where: { id: booking.slotId },
        data: {
          status: "OPEN",
          bookingId: null,
        },
      });
    }

    await tx.session.updateMany({
      where: { bookingId },
      data: { status: "CANCELLED" },
    });

    if (booking.openRequestId) {
      await tx.openRequest.update({
        where: { id: booking.openRequestId },
        data: { status: "CANCELLED" },
      });
    }
  });

  return normalizeBookingForResponse(bookingId);
}

export async function releaseBookingSlot(bookingId: string) {
  return releaseSlot(bookingId);
}

export async function getBookingChannel(bookingId: string) {
  return prisma.chatChannel.findFirst({
    where: { bookingId },
  });
}

export async function getBookingSession(bookingId: string) {
  return prisma.session.findUnique({
    where: { bookingId },
  });
}

export async function ensureBookingSessionAndChannel(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: { id: true, studentId: true, teacherId: true, openRequestId: true, status: true },
  });

  if (!booking) {
    throw notFound("Booking não encontrado");
  }

  await ensureSession(booking.id);
  await ensureChannel(booking.id, booking.studentId, booking.teacherId, booking.openRequestId ? "OPEN_REQUEST" : "BOOKING");
}

export async function loadBookingPublic(bookingId: string) {
  return loadBooking(bookingId);
}
