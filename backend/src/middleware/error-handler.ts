import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { AppError } from '@/common/errors';
import { error } from '@/common/response';
import { logger } from '@/config/logger';

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(error(err.message, err.details));
    return;
  }

  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
    res.status(422).json(error('Validation failed', details));
    return;
  }

  logger.error({ err, method: req.method, path: req.path }, 'Unhandled error');

  res.status(500).json(error('Internal server error'));
}
