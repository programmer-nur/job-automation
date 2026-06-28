import type { NextFunction, Request, Response } from 'express';

import { AppError } from '@/common/errors';
import { success } from '@/common/response';
import { applicationService } from '@/modules/applications/applications.service';
import {
  applicationListQuerySchema,
  applicationStatusSchema,
  createApplicationSchema,
  followUpSchema,
  notesSchema,
  updateApplicationSchema,
} from '@/modules/applications/applications.validation';

function getUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw AppError.unauthorized();
  }
  return userId;
}

function getParamId(req: Request): string {
  return req.params.id as string;
}

export async function createApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const data = createApplicationSchema.parse(req.body);
    const app = await applicationService.create(userId, data);
    res.status(201).json(success(app, 'Application created'));
  } catch (err) {
    next(err);
  }
}

export async function listApplications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const params = applicationListQuerySchema.parse(req.query);
    const result = await applicationService.list(userId, params);
    res.status(200).json(success(result.data, undefined, result.meta));
  } catch (err) {
    next(err);
  }
}

export async function getApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const app = await applicationService.getById(userId, getParamId(req));
    res.status(200).json(success(app));
  } catch (err) {
    next(err);
  }
}

export async function updateApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const data = updateApplicationSchema.parse(req.body);
    const app = await applicationService.update(userId, getParamId(req), data);
    res.status(200).json(success(app));
  } catch (err) {
    next(err);
  }
}

export async function deleteApplication(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    await applicationService.delete(userId, getParamId(req));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function updateApplicationStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const { status } = applicationStatusSchema.parse(req.body);
    const app = await applicationService.updateStatus(userId, getParamId(req), status);
    res.status(200).json(success(app));
  } catch (err) {
    next(err);
  }
}

export async function scheduleFollowUp(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const { followUpDate } = followUpSchema.parse(req.body);
    const app = await applicationService.scheduleFollowUp(
      userId,
      getParamId(req),
      new Date(followUpDate),
    );
    res.status(200).json(success(app));
  } catch (err) {
    next(err);
  }
}

export async function updateApplicationNotes(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const { notes } = notesSchema.parse(req.body);
    const app = await applicationService.updateNotes(userId, getParamId(req), notes);
    res.status(200).json(success(app));
  } catch (err) {
    next(err);
  }
}
