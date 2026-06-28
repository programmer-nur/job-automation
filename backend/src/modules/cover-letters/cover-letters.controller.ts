import type { NextFunction, Request, Response } from 'express';

import { AppError } from '@/common/errors';
import { success } from '@/common/response';
import { coverLetterService } from '@/modules/cover-letters/cover-letters.service';
import {
  coverLetterListQuerySchema,
  createCoverLetterSchema,
  generateCoverLetterSchema,
  updateCoverLetterSchema,
} from '@/modules/cover-letters/cover-letters.validation';

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

export async function createCoverLetter(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const data = createCoverLetterSchema.parse(req.body);
    const cl = await coverLetterService.create(userId, data);
    res.status(201).json(success(cl, 'Cover letter created'));
  } catch (err) {
    next(err);
  }
}

export async function listCoverLetters(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const params = coverLetterListQuerySchema.parse(req.query);
    const result = await coverLetterService.list(userId, params);
    res.status(200).json(success(result.data, undefined, result.meta));
  } catch (err) {
    next(err);
  }
}

export async function getCoverLetter(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const cl = await coverLetterService.getById(userId, getParamId(req));
    res.status(200).json(success(cl));
  } catch (err) {
    next(err);
  }
}

export async function updateCoverLetter(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const data = updateCoverLetterSchema.parse(req.body);
    const cl = await coverLetterService.update(userId, getParamId(req), data);
    res.status(200).json(success(cl));
  } catch (err) {
    next(err);
  }
}

export async function deleteCoverLetter(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    await coverLetterService.delete(userId, getParamId(req));
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function generateCoverLetter(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const data = generateCoverLetterSchema.parse(req.body);
    const result = await coverLetterService.generate(userId, data);
    res.status(200).json(success(result));
  } catch (err) {
    next(err);
  }
}
