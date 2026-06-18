import cron from "node-cron";
import prisma from "../lib/prisma";
import { env } from "../lib/env";
import { logger } from "../lib/logger";
import { sendBookingReminderEmail, sendReviewReminderEmail } from "./email.service";

let started = false;

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

async function processBookingReminders() {
  const now = new Date();
  const in24h = addHours(now, 24);
  const in23h = addHours(now, 23);
  const in1h = addHours(now, 1);
  const in59m = addMinutes(now, 59);
  const reviewCutoff = addMinutes(now, -30);

  const reminders24h = await prisma.booking.findMany({
    where: {
      status: {
        in: ["CONFIRMED", "IN_PROGRESS"],
      },
      scheduledFor: {
        gte: in23h,
        lte: in24h,
      },
      reminder24hSentAt: null,
    },
    select: {
      id: true,
      skill: true,
      scheduledFor: true,
      reminder24hSentAt: true,
      student: { select: { id: true, email: true, name: true } },
      teacher: { select: { id: true, email: true, name: true } },
    },
  });

  for (const booking of reminders24h) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { reminder24hSentAt: now },
    });

    const label = booking.scheduledFor ? booking.scheduledFor.toLocaleString() : "24 horas";
    void sendBookingReminderEmail(booking.student.email, booking.teacher.name, booking.skill, label);
    void sendBookingReminderEmail(booking.teacher.email, booking.student.name, booking.skill, label);
  }

  const reminders1h = await prisma.booking.findMany({
    where: {
      status: {
        in: ["CONFIRMED", "IN_PROGRESS"],
      },
      scheduledFor: {
        gte: in59m,
        lte: in1h,
      },
      reminder1hSentAt: null,
    },
    select: {
      id: true,
      skill: true,
      scheduledFor: true,
      reminder1hSentAt: true,
      student: { select: { id: true, email: true, name: true } },
      teacher: { select: { id: true, email: true, name: true } },
    },
  });

  for (const booking of reminders1h) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { reminder1hSentAt: now },
    });

    const label = booking.scheduledFor ? booking.scheduledFor.toLocaleString() : "1 hora";
    void sendBookingReminderEmail(booking.student.email, booking.teacher.name, booking.skill, label);
    void sendBookingReminderEmail(booking.teacher.email, booking.student.name, booking.skill, label);
  }

  const reviewReminders = await prisma.booking.findMany({
    where: {
      status: "COMPLETED",
      completedAt: {
        lte: reviewCutoff,
      },
      reviewReminderSentAt: null,
    },
    select: {
      id: true,
      skill: true,
      reviewReminderSentAt: true,
      student: { select: { id: true, email: true, name: true } },
      teacher: { select: { id: true, email: true, name: true } },
    },
  });

  for (const booking of reviewReminders) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { reviewReminderSentAt: now },
    });

    void sendReviewReminderEmail(booking.student.email, booking.teacher.name, booking.skill, booking.id);
    void sendReviewReminderEmail(booking.teacher.email, booking.student.name, booking.skill, booking.id);
  }
}

export function startReminderScheduler() {
  if (started) {
    return;
  }

  started = true;
  cron.schedule(env.reminderCronSchedule, () => {
    void processBookingReminders().catch((error) => {
      logger.error("Falha ao processar lembretes", error instanceof Error ? error.stack : error);
    });
  });

  logger.info(`Scheduler de lembretes activo em ${env.reminderCronSchedule}`);
}
