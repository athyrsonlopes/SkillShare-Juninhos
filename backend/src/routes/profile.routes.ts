import { Router } from "express";
import * as profileController from "../controllers/profile.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { profileUpdateSchema, avatarUploadSchema } from "../schemas/profile.schema";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.get("/", authenticate, asyncHandler(profileController.getMyProfile));
router.put("/", authenticate, validate(profileUpdateSchema), asyncHandler(profileController.updateProfile));
router.post("/avatarUpload", authenticate, validate(avatarUploadSchema), asyncHandler(profileController.uploadAvatar));
router.post("/avatar-upload", authenticate, validate(avatarUploadSchema), asyncHandler(profileController.uploadAvatar));
router.get("/:id", authenticate, asyncHandler(profileController.getProfileById));

export default router;
