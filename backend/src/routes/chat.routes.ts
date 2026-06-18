import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import * as chatController from "../controllers/chat.controller";

const router = Router();

router.get("/:channelId/messages", authenticate, asyncHandler(chatController.getMessages));

export default router;
