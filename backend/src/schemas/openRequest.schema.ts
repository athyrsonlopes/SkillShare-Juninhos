import { z } from "zod";

export const createOpenRequestSchema = z.object({
  skill: z.string().trim().min(1, "Skill é obrigatória"),
  level: z.enum(["INICIANTE", "INTERMEDIARIO", "AVANCADO"]),
  preferredDate: z.coerce.date().optional(),
  notes: z.string().trim().optional(),
});

export type CreateOpenRequestInput = z.infer<typeof createOpenRequestSchema>;
