import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../lib/errors";

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      next(new AppError("Dados inválidos", 400, "VALIDATION_ERROR", errors));
      return;
    }
    req.body = result.data;
    next();
  };
}
