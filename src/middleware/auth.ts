import type { Request, Response, NextFunction } from "express";
import { AppError } from "@/common/errors.js";
import { verifyAccessToken, type TokenPayload } from "@/utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header) {
    throw AppError.unauthorized("Missing auth token");
  }

  const parts = header.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw AppError.unauthorized("Invalid auth token format");
  }

  const token = parts[1];

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    throw AppError.unauthorized("Invalid or expired token");
  }
}

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized();
    }

    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden();
    }

    next();
  };
}
