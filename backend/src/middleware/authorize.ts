import type { NextFunction, Request, Response } from 'express';

import { AppError } from '@/common/errors';

export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw AppError.unauthorized();
    }

    if (!roles.includes(req.user.role)) {
      throw AppError.forbidden('Insufficient permissions');
    }

    next();
  };
}
