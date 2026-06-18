import { z } from "zod";

const skillSchema = z.object({
  name: z.string().trim().min(1, "Nome da skill é obrigatório"),
  kind: z.enum(["STUDY", "TEACH"]),
  level: z.enum(["INICIANTE", "INTERMEDIARIO", "AVANCADO"]),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(2).optional(),
  bio: z.string().trim().max(500).optional(),
  studyPreferences: z.array(z.string().trim().min(1)).optional(),
  contentToStudy: z.string().trim().max(1000).optional(),
  contentToTeach: z.string().trim().max(1000).optional(),
  skills: z.array(skillSchema).optional(),
});

export const avatarUploadSchema = z
  .object({
    avatar: z.string().trim().min(1).optional(),
    initials: z.string().trim().min(1).optional(),
  })
  .refine((value) => Boolean(value.avatar || value.initials), {
    message: "Fornece avatar ou iniciais",
    path: ["avatar"],
  });

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type AvatarUploadInput = z.infer<typeof avatarUploadSchema>;
export type ProfileSkillInput = z.infer<typeof skillSchema>;
