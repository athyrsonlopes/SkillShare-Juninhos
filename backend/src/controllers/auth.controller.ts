import { Response } from "express";
import * as authService from "../services/auth.service";
import { AuthRequest } from "../types";

export async function register(req: AuthRequest, res: Response) {
  const result = await authService.register(req.body);
  res.status(201).json(result);
}

export async function login(req: AuthRequest, res: Response) {
  const result = await authService.login(req.body);
  res.json(result);
}

export async function me(req: AuthRequest, res: Response) {
  const user = await authService.me(req.user!.userId);
  res.json(user);
}

export async function logout(req: AuthRequest, res: Response) {
  const result = await authService.logout(req.user!.jti);
  res.json(result);
}

export async function activateRole(req: AuthRequest, res: Response) {
  const user = await authService.activateProfessor(req.user!.userId);
  res.json(user);
}
