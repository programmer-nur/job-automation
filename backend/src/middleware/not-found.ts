import type { Request, Response } from 'express';

import { error } from '@/common/response';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json(error(`Route not found: ${req.method} ${req.path}`));
}
