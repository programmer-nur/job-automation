import type { NextFunction, Request, Response } from 'express';

import { AppError } from '@/common/errors';
import { success } from '@/common/response';
import { jobService } from '@/modules/jobs/jobs.service';
import {
  createJobSchema,
  updateJobSchema,
  jobStatusSchema,
  favoriteSchema,
  jobListQuerySchema,
} from '@/modules/jobs/jobs.validation';

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

export async function createJob(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const data = createJobSchema.parse(req.body);
    const job = await jobService.create(userId, data);
    res.status(201).json(success(job, 'Job created'));
  } catch (err) {
    next(err);
  }
}

export async function listJobs(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const params = jobListQuerySchema.parse(req.query);
    const result = await jobService.list(userId, params);
    res.status(200).json(success(result.data, undefined, result.meta));
  } catch (err) {
    next(err);
  }
}

export async function getJob(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const job = await jobService.getById(userId, getParamId(req));
    res.status(200).json(success(job));
  } catch (err) {
    next(err);
  }
}

export async function updateJob(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const data = updateJobSchema.parse(req.body);
    const job = await jobService.update(userId, getParamId(req), data);
    res.status(200).json(success(job));
  } catch (err) {
    next(err);
  }
}

export async function deleteJob(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    await jobService.delete(userId, getParamId(req));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function updateJobStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const { status } = jobStatusSchema.parse(req.body);
    const job = await jobService.updateStatus(userId, getParamId(req), status);
    res.status(200).json(success(job));
  } catch (err) {
    next(err);
  }
}

export async function toggleJobFavorite(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const { isFavorite } = favoriteSchema.parse(req.body);
    const job = await jobService.toggleFavorite(userId, getParamId(req), isFavorite);
    res.status(200).json(success(job));
  } catch (err) {
    next(err);
  }
}
