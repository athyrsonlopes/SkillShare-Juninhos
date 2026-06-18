import { Request } from "express";
import { Role } from "@prisma/client";

export interface JwtPayload {
  userId: string;
  role: Role;
  jti: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
