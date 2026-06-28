import type { NextFunction, Request, Response } from 'express';

import { AppError } from '@/common/errors';
import { verifyAccessToken } from '@/utils/jwt';

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw AppError.unauthorized('Missing authentication token');
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw AppError.badRequest('Invalid authorization header format');
  }

  const token = parts[1] as string;

  try {
    const decoded = verifyAccessToken(token);
    req.user = { userId: decoded.userId, role: decoded.role };
    next();
  } catch {
    throw AppError.unauthorized('Token expired');
  }
}
