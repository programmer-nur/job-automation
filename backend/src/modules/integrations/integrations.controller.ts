import type { NextFunction, Request, Response } from 'express';

import { AppError } from '@/common/errors';
import { success } from '@/common/response';
import { integrationService } from '@/modules/integrations/integrations.service';

function getUserId(req: Request): string {
  const userId = req.user?.userId as string | undefined;
  if (!userId) {
    throw AppError.unauthorized();
  }
  return userId;
}

export const googleSheetsController = {
  async sync(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await integrationService.syncGoogleSheets(getUserId(req));
      res.status(200).json(success(data));
    } catch (err) {
      next(err);
    }
  },

  async syncJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.params as { jobId: string };
      const data = await integrationService.syncGoogleSheetsJob(getUserId(req), jobId);
      res.status(200).json(success(data));
    } catch (err) {
      next(err);
    }
  },

  async exportData(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await integrationService.exportGoogleSheets(getUserId(req));
      res.status(200).json(success(data));
    } catch (err) {
      next(err);
    }
  },
};

export const trelloController = {
  async sync(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await integrationService.syncTrello(getUserId(req));
      res.status(200).json(success(data));
    } catch (err) {
      next(err);
    }
  },

  async createCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jobId } = req.body as { jobId: string };
      if (!jobId) {
        throw new AppError(422, 'VALIDATION', 'jobId is required');
      }
      const data = await integrationService.createTrelloCard(getUserId(req), jobId);
      res.status(200).json(success(data));
    } catch (err) {
      next(err);
    }
  },

  async moveCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cardId } = req.params as { cardId: string };
      const { list } = req.body as { list?: string };
      const data = await integrationService.moveTrelloCard(getUserId(req), cardId, list);
      res.status(200).json(success(data));
    } catch (err) {
      next(err);
    }
  },

  async deleteCard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { cardId } = req.params as { cardId: string };
      const data = await integrationService.deleteTrelloCard(getUserId(req), cardId);
      res.status(200).json(success(data));
    } catch (err) {
      next(err);
    }
  },
};
