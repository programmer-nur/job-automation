import type { Request, Response, NextFunction } from "express";
import { AppError } from "@/common/errors.js";
import { logger } from "@/services/logger.js";

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  const zodError = err as { issues?: Array<{ path: (string | number)[]; message: string }> };
  if (zodError.issues) {
    const details = zodError.issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    res.status(422).json({
      success: false,
      message: "Validation failed",
      errors: details,
    });
    return;
  }

  logger.error(err, "Unhandled error");
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
