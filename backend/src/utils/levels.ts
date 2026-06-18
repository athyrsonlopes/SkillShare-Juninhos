import { Role, SkillLevel } from "@prisma/client";
import { badRequest } from "../lib/errors";

const skillLevelRank: Record<SkillLevel, number> = {
  INICIANTE: 1,
  INTERMEDIARIO: 2,
  AVANCADO: 3,
};

export function normalizeSkillLevel(value?: string | null): SkillLevel {
  const normalized = (value || "").trim().toUpperCase();

  if (!normalized) {
    return "INICIANTE";
  }

  if (normalized === "BEGINNER") return "INICIANTE";
  if (normalized === "INTERMEDIATE") return "INTERMEDIARIO";
  if (normalized === "ADVANCED") return "AVANCADO";

  if (normalized === "INICIANTE" || normalized === "INTERMEDIARIO" || normalized === "AVANCADO") {
    return normalized;
  }

  throw badRequest(`Nível inválido: ${value}`);
}

export function skillLevelAtLeast(current: SkillLevel, required: SkillLevel) {
  return skillLevelRank[current] >= skillLevelRank[required];
}

export function normalizeRole(value?: string | null): Role {
  const normalized = (value || "USER").trim().toUpperCase();

  if (normalized === "USER" || normalized === "ALUNO" || normalized === "STUDENT") return "USER";
  if (normalized === "PROFESSOR" || normalized === "TEACHER" || normalized === "MENTOR") return "PROFESSOR";
  if (normalized === "ADMIN") return "ADMIN";

  throw badRequest(`Papel inválido: ${value}`);
}

export function parseList(value?: string | string[] | null) {
  if (!value) {
    return [] as string[];
  }

  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
