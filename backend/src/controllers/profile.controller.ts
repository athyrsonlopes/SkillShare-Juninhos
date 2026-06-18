import { Response } from "express";
import * as profileService from "../services/profile.service";
import { AuthRequest } from "../types";

export async function getMyProfile(req: AuthRequest, res: Response) {
  const profile = await profileService.getProfile(req.user!.userId);
  res.json(profile);
}

export async function getProfileById(req: AuthRequest, res: Response) {
  const profile = await profileService.getProfileById(req.user!.userId, String(req.params.id));
  res.json(profile);
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const profile = await profileService.updateProfile(req.user!.userId, req.body);
  res.json(profile);
}

export async function uploadAvatar(req: AuthRequest, res: Response) {
  const profile = await profileService.uploadAvatar(req.user!.userId, req.body);
  res.json(profile);
}
