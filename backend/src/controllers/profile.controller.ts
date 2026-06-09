import { Response } from "express";
import * as profileService from "../services/profile.service";
import { AuthRequest } from "../types";

export async function getProfile(req: AuthRequest, res: Response) {
  try {
    const profile = await profileService.getProfile(req.user!.userId);
    res.json(profile);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
}

export async function updateProfile(req: AuthRequest, res: Response) {
  try {
    const profile = await profileService.updateProfile(req.user!.userId, req.body);
    res.json(profile);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function updateUser(req: AuthRequest, res: Response) {
  try {
    const user = await profileService.updateUser(req.user!.userId, req.body);
    res.json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
