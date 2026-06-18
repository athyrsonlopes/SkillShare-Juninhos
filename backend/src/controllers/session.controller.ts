import { Response } from "express";
import { AuthRequest } from "../types";
import * as sessionService from "../services/session.service";

export async function startSession(req: AuthRequest, res: Response) {
  const session = await sessionService.startSession(req.user!.userId, req.user!.role, String(req.params.id));
  res.json(session);
}

export async function endSession(req: AuthRequest, res: Response) {
  const session = await sessionService.endSession(req.user!.userId, req.user!.role, String(req.params.id));
  res.json(session);
}

export async function listSessions(req: AuthRequest, res: Response) {
  const sessions = await sessionService.listSessions(req.user!.userId, req.user!.role);
  res.json(sessions);
}

export async function getSession(req: AuthRequest, res: Response) {
  const session = await sessionService.getSession(req.user!.userId, req.user!.role, String(req.params.id));
  res.json(session);
}
