import type { ValidationError } from "./types.js";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: ValidationError[],
  ) {
    super(message);
    this.name = "AppError";
  }

  static notFound(resource: string): AppError {
    return new AppError(404, "NOT_FOUND", `${resource} not found`);
  }

  static badRequest(message: string): AppError {
    return new AppError(400, "BAD_REQUEST", message);
  }

  static unauthorized(message = "Unauthorized"): AppError {
    return new AppError(401, "UNAUTHORIZED", message);
  }

  static forbidden(message = "Forbidden"): AppError {
    return new AppError(403, "FORBIDDEN", message);
  }

  static conflict(message: string): AppError {
    return new AppError(409, "CONFLICT", message);
  }

  static validation(details: ValidationError[]): AppError {
    return new AppError(422, "VALIDATION_ERROR", "Validation failed", details);
  }

  toJSON() {
    return {
      success: false,
      message: this.message,
      code: this.code,
      ...(this.details && { errors: this.details }),
    };
  }
}
