import type { NextFunction, Request, Response } from 'express';

import { success } from '@/common/response';
import { getHealthStatus } from '@/modules/health/health.service';

export async function getHealth(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const status = await getHealthStatus();
    res.json(success(status));
  } catch (error) {
    next(error);
  }
}
