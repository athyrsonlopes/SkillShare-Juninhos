import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    logger.warn(err.message);
    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      details: err.details,
    });
    return;
  }

  if (err instanceof ZodError) {
    logger.warn("Erro de validação", err.flatten());
    res.status(400).json({
      error: "Dados inválidos",
      details: err.flatten().fieldErrors,
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({ error: "Registro já existe" });
      return;
    }
    if (err.code === "P2025") {
      res.status(404).json({ error: "Recurso não encontrado" });
      return;
    }
  }

  const error = err instanceof Error ? err : new Error("Erro desconhecido");
  logger.error(error.message, error.stack);
  res.status(500).json({ error: "Erro interno do servidor" });
}
