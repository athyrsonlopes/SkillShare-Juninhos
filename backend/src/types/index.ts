import { Request } from "express";

export interface JwtPayload {
  userId: string;
  role: "USER" | "ADMIN";
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}
