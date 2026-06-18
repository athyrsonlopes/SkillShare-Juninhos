import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import * as openRequestController from "../controllers/openRequest.controller";
import { validate } from "../middlewares/validate.middleware";
import { createOpenRequestSchema } from "../schemas/openRequest.schema";

const router = Router();

router.post("/", authenticate, validate(createOpenRequestSchema), asyncHandler(openRequestController.createOpenRequest));
router.get("/", authenticate, asyncHandler(openRequestController.listFeed));
router.get("/mine", authenticate, asyncHandler(openRequestController.listMine));
router.post("/:id/match", authenticate, asyncHandler(openRequestController.matchOpenRequest));
router.delete("/:id", authenticate, asyncHandler(openRequestController.cancelOpenRequest));

export default router;
