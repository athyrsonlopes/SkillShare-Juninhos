import { Router } from "express";
import * as profileController from "../controllers/profile.controller";
import { authenticate } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", authenticate, profileController.getProfile);
router.patch("/", authenticate, profileController.updateProfile);
router.patch("/user", authenticate, profileController.updateUser);

export default router;
