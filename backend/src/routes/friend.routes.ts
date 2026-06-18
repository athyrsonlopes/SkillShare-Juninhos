import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import * as friendController from "../controllers/friend.controller";

const router = Router();

router.post("/:userId", authenticate, asyncHandler(friendController.addFriend));
router.get("/", authenticate, asyncHandler(friendController.listFriends));
router.delete("/:userId", authenticate, asyncHandler(friendController.removeFriend));

export default router;
