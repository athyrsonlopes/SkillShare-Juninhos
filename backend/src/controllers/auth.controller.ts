import { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { AuthRequest } from "../types";

export async function register(req: Request, res: Response) {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
}

export async function me(req: AuthRequest, res: Response) {
  res.json({ user: req.user });
}
