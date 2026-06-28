import type { NextFunction, Request, Response } from 'express';

import { AppError } from '@/common/errors';
import { success } from '@/common/response';
import { resumeService } from '@/modules/resumes/resumes.service';
import {
  createResumeSchema,
  resumeListQuerySchema,
  tailorResumeSchema,
  updateResumeSchema,
} from '@/modules/resumes/resumes.validation';

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

export async function createResume(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const data = createResumeSchema.parse(req.body);
    const resume = await resumeService.create(userId, data);
    res.status(201).json(success(resume, 'Resume created'));
  } catch (err) {
    next(err);
  }
}

export async function listResumes(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const params = resumeListQuerySchema.parse(req.query);
    const result = await resumeService.list(userId, params);
    res.status(200).json(success(result.data, undefined, result.meta));
  } catch (err) {
    next(err);
  }
}

export async function getResume(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const resume = await resumeService.getById(userId, getParamId(req));
    res.status(200).json(success(resume));
  } catch (err) {
    next(err);
  }
}

export async function updateResume(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const data = updateResumeSchema.parse(req.body);
    const resume = await resumeService.update(userId, getParamId(req), data);
    res.status(200).json(success(resume));
  } catch (err) {
    next(err);
  }
}

export async function deleteResume(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    await resumeService.delete(userId, getParamId(req));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function setActiveResume(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const resume = await resumeService.setActive(userId, getParamId(req));
    res.status(200).json(success(resume));
  } catch (err) {
    next(err);
  }
}

export async function tailorResume(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const { jobId } = tailorResumeSchema.parse(req.body);
    const result = await resumeService.tailor(userId, getParamId(req), jobId);
    res.status(200).json(success(result));
  } catch (err) {
    next(err);
  }
}
