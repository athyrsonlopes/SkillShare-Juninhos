import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import * as sessionController from "../controllers/session.controller";

const router = Router();

router.post("/:id/start", authenticate, asyncHandler(sessionController.startSession));
router.post("/:id/end", authenticate, asyncHandler(sessionController.endSession));
router.get("/", authenticate, asyncHandler(sessionController.listSessions));
router.get("/:id", authenticate, asyncHandler(sessionController.getSession));

export default router;
