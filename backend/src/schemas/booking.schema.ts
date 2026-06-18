import { z } from "zod";

export const createBookingSchema = z.object({
  teacherId: z.string().uuid(),
  slotId: z.string().uuid(),
  skill: z.string().trim().min(1, "Skill é obrigatória"),
  notes: z.string().trim().optional(),
});

export const scheduleBookingSchema = z.object({
  scheduledFor: z.coerce.date(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type ScheduleBookingInput = z.infer<typeof scheduleBookingSchema>;
