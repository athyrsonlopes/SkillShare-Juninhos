import { Router } from "express";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";
import * as bookingController from "../controllers/booking.controller";
import { validate } from "../middlewares/validate.middleware";
import { createBookingSchema, scheduleBookingSchema } from "../schemas/booking.schema";

const router = Router();

router.post("/", authenticate, validate(createBookingSchema), asyncHandler(bookingController.createBooking));
router.get("/", authenticate, asyncHandler(bookingController.listBookings));
router.get("/:id", authenticate, asyncHandler(bookingController.getBooking));
router.patch("/:id", authenticate, validate(scheduleBookingSchema), asyncHandler(bookingController.scheduleBooking));
router.patch("/:id/confirm", authenticate, asyncHandler(bookingController.confirmBooking));
router.patch("/:id/cancel", authenticate, asyncHandler(bookingController.cancelBooking));

export default router;
