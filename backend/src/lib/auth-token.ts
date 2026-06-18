import jwt from "jsonwebtoken";
import { Role } from "@prisma/client";
import prisma from "./prisma";
import { env } from "./env";
import { unauthorized } from "./errors";
import { JwtPayload } from "../types";

export function extractBearerToken(header?: string) {
  if (!header || !header.startsWith("Bearer ")) {
    return null;
  }

  return header.split(" ")[1] || null;
}

export async function resolveAuthenticatedPayload(token: string): Promise<JwtPayload> {
  const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
  const session = await prisma.authSession.findUnique({
    where: { jti: decoded.jti },
  });

  if (!session || session.revokedAt) {
    throw unauthorized("Sessão inválida ou expirada");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { id: true, role: true },
  });

  if (!user) {
    throw unauthorized("Utilizador não encontrado");
  }

  return {
    userId: user.id,
    role: user.role as Role,
    jti: decoded.jti,
  };
}
