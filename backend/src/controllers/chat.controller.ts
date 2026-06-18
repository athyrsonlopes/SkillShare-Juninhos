import { Response } from "express";
import { AuthRequest } from "../types";
import * as chatService from "../services/chat.service";

export async function getMessages(req: AuthRequest, res: Response) {
  const messages = await chatService.getChannelMessages(String(req.params.channelId), req.user!.userId, req.user!.role);
  res.json(messages);
}
