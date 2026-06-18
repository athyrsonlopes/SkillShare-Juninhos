import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import * as mentorController from "../controllers/mentor.controller";
import { validate } from "../middlewares/validate.middleware";
import { createSlotSchema } from "../schemas/mentor.schema";

const router = Router();

router.get("/", authenticate, asyncHandler(mentorController.listMentors));
router.get("/:id/slots", authenticate, asyncHandler(mentorController.getMentorSlots));
router.post("/slots", authenticate, validate(createSlotSchema), asyncHandler(mentorController.createSlot));
router.delete("/slots/:slotId", authenticate, asyncHandler(mentorController.deleteSlot));

export default router;
