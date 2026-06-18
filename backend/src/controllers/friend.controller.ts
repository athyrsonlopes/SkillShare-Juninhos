import { Response } from "express";
import { AuthRequest } from "../types";
import * as friendService from "../services/friend.service";

export async function addFriend(req: AuthRequest, res: Response) {
  const friend = await friendService.addFriend(req.user!.userId, String(req.params.userId));
  res.status(201).json(friend);
}

export async function listFriends(req: AuthRequest, res: Response) {
  const friends = await friendService.listFriends(req.user!.userId);
  res.json(friends);
}

export async function removeFriend(req: AuthRequest, res: Response) {
  const result = await friendService.removeFriend(req.user!.userId, String(req.params.userId));
  res.json(result);
}
