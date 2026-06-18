import { Response } from "express";
import { AuthRequest } from "../types";
import * as bookingService from "../services/booking.service";

export async function createBooking(req: AuthRequest, res: Response) {
  const booking = await bookingService.createDirectBooking(req.user!.userId, req.body);
  res.status(201).json(booking);
}

export async function listBookings(req: AuthRequest, res: Response) {
  const bookings = await bookingService.listBookings(req.user!.userId, req.user!.role);
  res.json(bookings);
}

export async function getBooking(req: AuthRequest, res: Response) {
  const booking = await bookingService.getBooking(req.user!.userId, req.user!.role, String(req.params.id));
  res.json(booking);
}

export async function scheduleBooking(req: AuthRequest, res: Response) {
  const booking = await bookingService.scheduleBooking(req.user!.userId, req.user!.role, String(req.params.id), req.body);
  res.json(booking);
}

export async function confirmBooking(req: AuthRequest, res: Response) {
  const booking = await bookingService.confirmBooking(req.user!.userId, req.user!.role, String(req.params.id));
  res.json(booking);
}

export async function cancelBooking(req: AuthRequest, res: Response) {
  const booking = await bookingService.cancelBooking(req.user!.userId, req.user!.role, String(req.params.id));
  res.json(booking);
}
