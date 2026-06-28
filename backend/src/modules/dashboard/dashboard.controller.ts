import type { Request, Response } from 'express';

import { AppError } from '@/common/errors';
import { success } from '@/common/response';
import { dashboardService } from '@/modules/dashboard/dashboard.service';

function getUserId(req: Request): string {
  const userId = req.user?.userId as string | undefined;
  if (!userId) {
    throw AppError.unauthorized();
  }
  return userId;
}

export const dashboardController = {
  async getSummary(req: Request, res: Response): Promise<void> {
    const data = await dashboardService.getSummary(getUserId(req));
    res.status(200).json(success(data));
  },

  async getMonthly(req: Request, res: Response): Promise<void> {
    const data = await dashboardService.getMonthly(getUserId(req));
    res.status(200).json(success(data));
  },

  async getMatchScores(req: Request, res: Response): Promise<void> {
    const data = await dashboardService.getMatchScores(getUserId(req));
    res.status(200).json(success(data));
  },

  async getSources(req: Request, res: Response): Promise<void> {
    const data = await dashboardService.getSources(getUserId(req));
    res.status(200).json(success(data));
  },
};
