import { Response } from "express";
import { AuthRequest } from "../types";
import * as mentorService from "../services/mentor.service";

export async function listMentors(req: AuthRequest, res: Response) {
  const mentors = await mentorService.listMentors(req.user!.userId, req.query.skill as string | undefined, req.query.level as string | undefined);
  res.json(mentors);
}

export async function getMentorSlots(req: AuthRequest, res: Response) {
  const result = await mentorService.getMentorSlots(String(req.params.id));
  res.json(result);
}

export async function createSlot(req: AuthRequest, res: Response) {
  const slot = await mentorService.createSlot(req.user!.userId, req.user!.role, req.body);
  res.status(201).json(slot);
}

export async function deleteSlot(req: AuthRequest, res: Response) {
  const result = await mentorService.deleteSlot(req.user!.userId, req.user!.role, String(req.params.slotId));
  res.json(result);
}
