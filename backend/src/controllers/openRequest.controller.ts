import { Response } from "express";
import { AuthRequest } from "../types";
import * as openRequestService from "../services/openRequest.service";

export async function createOpenRequest(req: AuthRequest, res: Response) {
  const request = await openRequestService.createOpenRequest(req.user!.userId, req.body);
  res.status(201).json(request);
}

export async function listFeed(req: AuthRequest, res: Response) {
  const requests = await openRequestService.listCompatibleFeed(req.user!.userId);
  res.json(requests);
}

export async function listMine(req: AuthRequest, res: Response) {
  const requests = await openRequestService.listMine(req.user!.userId);
  res.json(requests);
}

export async function matchOpenRequest(req: AuthRequest, res: Response) {
  const result = await openRequestService.matchOpenRequest(req.user!.userId, req.user!.role, String(req.params.id));
  res.json(result);
}

export async function cancelOpenRequest(req: AuthRequest, res: Response) {
  const request = await openRequestService.cancelOpenRequest(req.user!.userId, req.user!.role, String(req.params.id));
  res.json(request);
}
