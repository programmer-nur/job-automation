import type { NextFunction, Request, Response } from 'express';

import { AppError } from '@/common/errors';
import { success } from '@/common/response';
import { notificationService } from '@/modules/notifications/notifications.service';
import {
  createNotificationSchema,
  notificationListQuerySchema,
} from '@/modules/notifications/notifications.validation';

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

export async function createNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const data = createNotificationSchema.parse(req.body);
    const notification = await notificationService.create(userId, data);
    res.status(201).json(success(notification, 'Notification created'));
  } catch (err) {
    next(err);
  }
}

export async function listNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const params = notificationListQuerySchema.parse(req.query);
    const result = await notificationService.list(userId, params);
    res.status(200).json(success(result.data, undefined, result.meta));
  } catch (err) {
    next(err);
  }
}

export async function getNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const notification = await notificationService.getById(userId, getParamId(req));
    res.status(200).json(success(notification));
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    const notification = await notificationService.markAsRead(userId, getParamId(req));
    res.status(200).json(success(notification));
  } catch (err) {
    next(err);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = getUserId(req);
    await notificationService.markAllAsRead(userId);
    res.status(200).json(success(undefined, 'All notifications marked as read'));
  } catch (err) {
    next(err);
  }
}
