import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { Role } from "@prisma/client";
import prisma from "../lib/prisma";
import { env } from "../lib/env";
import { AppError, forbidden, notFound, unauthorized } from "../lib/errors";
import { LoginInput, RegisterInput } from "../schemas/auth.schema";
import { publicUserSelect, fullProfileSelect } from "../lib/selects";
import { sendWelcomeEmail } from "./email.service";

const authUserSelect = {
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
    },
  },
} as const;

function parseTokenExpiry(value: string) {
  const match = value.trim().match(/^(\d+)([smhdw])$/i);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
    w: 7 * 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
}

function buildTokenPayload(user: { id: string; role: Role }) {
  const jti = randomUUID();
  const token = jwt.sign({ userId: user.id, role: user.role, jti }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn as jwt.SignOptions["expiresIn"],
  });

  const expiresAt = new Date(Date.now() + parseTokenExpiry(env.jwtExpiresIn));
  return { token, jti, expiresAt };
}

async function createSession(user: { id: string; role: Role }) {
  const { token, jti, expiresAt } = buildTokenPayload(user);
  await prisma.authSession.create({
    data: {
      jti,
      userId: user.id,
      expiresAt,
    },
  });
  return token;
}

async function loadUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: authUserSelect,
  });

  if (!user) {
    throw notFound("Utilizador não encontrado");
  }

  return user;
}

export async function register(input: RegisterInput) {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    throw new AppError("Email já está em uso", 409, "EMAIL_IN_USE");
  }

  if (input.role === "ADMIN" && input.adminKey !== env.adminInviteKey) {
    throw forbidden("Registo de administrador não autorizado");
  }

  const password = await bcrypt.hash(input.password, 10);

  const user = await prisma.user.create({
    data: {
      name: input.name.trim(),
      email,
      password,
      role: input.role as Role,
      profile: {
        create: {},
      },
    },
    select: authUserSelect,
  });

  const token = await createSession(user);
  void sendWelcomeEmail(user.email, user.name);

  return { user, token };
}

export async function login(input: LoginInput) {
  const email = input.email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      avatar: true,
      avgRating: true,
      ratingsCount: true,
      createdAt: true,
      updatedAt: true,
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
        },
      },
    },
  });

  if (!user) {
    throw unauthorized("Email ou password incorretos");
  }

  const valid = await bcrypt.compare(input.password, user.password);
  if (!valid) {
    throw unauthorized("Email ou password incorretos");
  }

  const token = await createSession(user);
  const { password: _password, ...safeUser } = user;
  return { user: safeUser, token };
}

export async function logout(jti: string) {
  const session = await prisma.authSession.findUnique({ where: { jti } });
  if (!session) {
    throw unauthorized("Sessão inválida");
  }

  await prisma.authSession.update({
    where: { jti },
    data: { revokedAt: new Date() },
  });

  return { message: "Sessão terminada" };
}

export async function me(userId: string) {
  return loadUser(userId);
}

export async function activateProfessor(userId: string) {
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!current) {
    throw notFound("Utilizador não encontrado");
  }

  if (current.role === "ADMIN" || current.role === "PROFESSOR") {
    return loadUser(userId);
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: "PROFESSOR" },
  });

  return loadUser(userId);
}
