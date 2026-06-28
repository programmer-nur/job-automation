import type { NextFunction, Request, Response } from 'express';

import { AppError } from '@/common/errors';
import { success } from '@/common/response';
import { aiService } from '@/modules/ai/ai.service';
import {
  generateCoverLetterSchema,
  interviewPrepSchema,
  parseJobSchema,
  scoreJobSchema,
  skillGapSchema,
  tailorResumeSchema,
} from '@/modules/ai/ai.validation';

function getUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw AppError.unauthorized();
  }
  return userId;
}

export async function parseJob(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const data = parseJobSchema.parse(req.body);
    const result = await aiService.parseJob(userId, data);
    res.status(201).json(success(result, 'Job parsed successfully'));
  } catch (err) {
    next(err);
  }
}

export async function scoreJob(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const data = scoreJobSchema.parse(req.body);
    const result = await aiService.scoreJob(userId, data);
    res.status(201).json(success(result, 'Job scored successfully'));
  } catch (err) {
    next(err);
  }
}

export async function tailorResume(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const data = tailorResumeSchema.parse(req.body);
    const result = await aiService.tailorResume(userId, data);
    res.status(201).json(success(result, 'Resume tailored successfully'));
  } catch (err) {
    next(err);
  }
}

export async function generateCoverLetter(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const data = generateCoverLetterSchema.parse(req.body);
    const result = await aiService.generateCoverLetter(userId, data);
    res.status(201).json(success(result, 'Cover letter generated successfully'));
  } catch (err) {
    next(err);
  }
}

export async function detectSkillGap(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const data = skillGapSchema.parse(req.body);
    const result = await aiService.detectSkillGap(userId, data);
    res.status(201).json(success(result, 'Skill gap analysis complete'));
  } catch (err) {
    next(err);
  }
}

export async function interviewPrep(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const data = interviewPrepSchema.parse(req.body);
    const result = await aiService.interviewPrep(userId, data);
    res.status(201).json(success(result, 'Interview preparation complete'));
  } catch (err) {
    next(err);
  }
}
