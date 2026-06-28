import type { NextFunction, Request, Response } from 'express';

import { AppError } from '@/common/errors';
import { success } from '@/common/response';
import { authService } from '@/modules/auth/auth.service';
import {
  changePasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
} from '@/modules/auth/auth.validation';

function getUserId(req: Request): string {
  const userId = req.user?.userId;
  if (!userId) {
    throw AppError.unauthorized();
  }
  return userId;
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);
    const result = await authService.register(data);
    res.status(201).json(success(result, 'Registration successful'));
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data);
    res.status(200).json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const data = refreshSchema.parse(req.body);
    const result = await authService.refresh(data.refreshToken);
    res.status(200).json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const { refreshToken } = req.body;
    await authService.logout(userId, refreshToken);
    res.status(200).json(success(null, 'Logged out successfully'));
  } catch (err) {
    next(err);
  }
}

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const user = await authService.getProfile(userId);
    res.status(200).json(success(user));
  } catch (err) {
    next(err);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const data = changePasswordSchema.parse(req.body);
    await authService.changePassword(userId, data.currentPassword, data.newPassword);
    res.status(200).json(success(null, 'Password changed successfully'));
  } catch (err) {
    next(err);
  }
}
