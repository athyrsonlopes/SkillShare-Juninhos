import { z } from "zod";

export const createSlotSchema = z
  .object({
    skill: z.string().trim().min(1, "Skill é obrigatória"),
    level: z.enum(["INICIANTE", "INTERMEDIARIO", "AVANCADO"]),
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    notes: z.string().trim().optional(),
  })
  .refine((value) => value.endsAt > value.startsAt, {
    message: "A hora final deve ser posterior à inicial",
    path: ["endsAt"],
  });

export type CreateSlotInput = z.infer<typeof createSlotSchema>;
