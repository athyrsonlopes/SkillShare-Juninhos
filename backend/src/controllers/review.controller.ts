import { Response } from "express";
import { AuthRequest } from "../types";
import * as reviewService from "../services/review.service";

export async function submitReview(req: AuthRequest, res: Response) {
  const review = await reviewService.submitReview(req.user!.userId, req.user!.role, req.body);
  res.status(201).json(review);
}

export async function listMentorReviews(req: AuthRequest, res: Response) {
  const result = await reviewService.listMentorReviews(String(req.params.id));
  res.json(result);
}
