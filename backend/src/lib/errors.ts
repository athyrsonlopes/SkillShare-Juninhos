export class AppError extends Error {
  statusCode: number;
  code?: string;
  details?: unknown;

  constructor(message: string, statusCode = 400, code?: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function badRequest(message: string, details?: unknown) {
  return new AppError(message, 400, "BAD_REQUEST", details);
}

export function unauthorized(message = "Não autenticado") {
  return new AppError(message, 401, "UNAUTHORIZED");
}

export function forbidden(message = "Sem permissão") {
  return new AppError(message, 403, "FORBIDDEN");
}

export function notFound(message = "Recurso não encontrado") {
  return new AppError(message, 404, "NOT_FOUND");
}

export function conflict(message: string) {
  return new AppError(message, 409, "CONFLICT");
}
