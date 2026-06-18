import { Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { forbidden, unauthorized } from "../lib/errors";
import { AuthRequest, JwtPayload } from "../types";
import { extractBearerToken, resolveAuthenticatedPayload } from "../lib/auth-token";

export async function authenticate(req: AuthRequest, _res: Response, next: NextFunction) {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    next(unauthorized("Token não fornecido"));
    return;
  }

  try {
    req.user = await resolveAuthenticatedPayload(token);
    next();
  } catch {
    next(unauthorized("Token inválido ou expirado"));
  }
}

export function authorize(...roles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(unauthorized());
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(forbidden("Sem permissão"));
      return;
    }

    next();
  };
}
