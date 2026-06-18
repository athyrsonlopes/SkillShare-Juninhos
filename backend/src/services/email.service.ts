import nodemailer from "nodemailer";
import { env } from "../lib/env";
import { logger } from "../lib/logger";

const hasTransport = Boolean(env.smtpUser && env.smtpPass);

const transporter = hasTransport
  ? nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpPort === 465,
      auth: {
        user: env.smtpUser,
        pass: env.smtpPass,
      },
    })
  : null;

async function sendEmail(to: string, subject: string, html: string) {
  if (!transporter) {
    logger.warn("SMTP não configurado; email ignorado", { to, subject });
    return false;
  }

  await transporter.sendMail({
    from: env.smtpUser ? `SkillShare <${env.smtpUser}>` : "SkillShare <no-reply@skillshare.local>",
    to,
    subject,
    html,
  });

  return true;
}

export async function sendWelcomeEmail(to: string, name: string) {
  return sendEmail(
    to,
    "Bem-vindo ao SkillShare!",
    `<h1>Olá ${name}!</h1><p>A tua conta foi criada com sucesso.</p>`
  );
}

export async function sendBookingRequestedEmail(to: string, studentName: string, skill: string) {
  return sendEmail(
    to,
    `Novo pedido de aula: ${skill}`,
    `<p>${studentName} pediu uma aula de <strong>${skill}</strong>.</p>`
  );
}

export async function sendBookingConfirmedEmail(to: string, counterpartName: string, skill: string, meetLink?: string | null) {
  return sendEmail(
    to,
    `Aula confirmada: ${skill}`,
    `<p>A tua sessão com ${counterpartName} foi confirmada.</p>${meetLink ? `<p>Link: <a href="${meetLink}">${meetLink}</a></p>` : ""}`
  );
}

export async function sendBookingReminderEmail(to: string, counterpartName: string, skill: string, whenLabel: string) {
  return sendEmail(
    to,
    `Lembrete de aula: ${skill}`,
    `<p>A tua sessão com ${counterpartName} está marcada para ${whenLabel}.</p>`
  );
}

export async function sendSessionStartedEmail(to: string, skill: string, meetLink: string) {
  return sendEmail(
    to,
    `Sessão iniciada: ${skill}`,
    `<p>A sessão começou.</p><p>Link: <a href="${meetLink}">${meetLink}</a></p>`
  );
}

export async function sendReviewReminderEmail(to: string, counterpartName: string, skill: string, sessionId: string) {
  return sendEmail(
    to,
    `Avalia a sessão de ${skill}`,
    `<p>A tua sessão com ${counterpartName} terminou.</p><p>Session ID: ${sessionId}</p>`
  );
}
