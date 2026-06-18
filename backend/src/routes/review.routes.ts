import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import * as reviewController from "../controllers/review.controller";
import { validate } from "../middlewares/validate.middleware";
import { createReviewSchema } from "../schemas/review.schema";

const router = Router();

router.post("/reviews", authenticate, validate(createReviewSchema), asyncHandler(reviewController.submitReview));
router.get("/mentors/:id/reviews", authenticate, asyncHandler(reviewController.listMentorReviews));

export default router;
