import type { NextFunction, Request, Response } from 'express';

import { success } from '@/common/response';
import { adminService } from '@/modules/admin/admin.service';

export const adminController = {
  async listUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await adminService.listUsers(
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined,
      );
      res.status(200).json(success(result.data, undefined, result.meta));
    } catch (err) {
      next(err);
    }
  },

  async listJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await adminService.listJobs(
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined,
      );
      res.status(200).json(success(result.data, undefined, result.meta));
    } catch (err) {
      next(err);
    }
  },

  async getAiStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await adminService.getAiStats(
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined,
      );
      res.status(200).json(success(result.data, undefined, result.meta));
    } catch (err) {
      next(err);
    }
  },

  async listAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page, limit } = req.query;
      const result = await adminService.listAuditLogs(
        page ? Number(page) : undefined,
        limit ? Number(limit) : undefined,
      );
      res.status(200).json(success(result.data, undefined, result.meta));
    } catch (err) {
      next(err);
    }
  },
};
