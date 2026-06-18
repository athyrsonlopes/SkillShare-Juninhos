import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().trim().email("Email inválido").transform((value) => value.toLowerCase()),
  password: z.string().min(6, "Palavra-passe deve ter pelo menos 6 caracteres"),
  role: z.enum(["USER", "PROFESSOR", "ADMIN"]).default("USER"),
  adminKey: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Email inválido").transform((value) => value.toLowerCase()),
  password: z.string().min(1, "Palavra-passe é obrigatória"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
