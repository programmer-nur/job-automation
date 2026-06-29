import type { Request, Response } from "express";
import { success } from "@/common/response.js";
import * as notificationService from "./notifications.service.js";
import {
  createNotificationSchema,
  notificationListQuerySchema,
} from "./notifications.validation.js";

export async function create(req: Request, res: Response) {
  const parsed = createNotificationSchema.parse(req.body);
  const n = await notificationService.createNotification(req.user!.userId, parsed);
  res.status(201).json(success(n, "Notification created"));
}

export async function list(req: Request, res: Response) {
  const query = notificationListQuerySchema.parse(req.query);
  const result = await notificationService.listNotifications(req.user!.userId, query);
  res.json(success(result.data, "Notifications retrieved", result.meta));
}

export async function getById(req: Request, res: Response) {
  const id = req.params.id as string;
  const n = await notificationService.getNotification(req.user!.userId, id);
  res.json(success(n, "Notification retrieved"));
}

export async function markAsRead(req: Request, res: Response) {
  const id = req.params.id as string;
  const n = await notificationService.markAsRead(req.user!.userId, id);
  res.json(success(n, "Notification marked as read"));
}

export async function markAllAsRead(req: Request, res: Response) {
  const result = await notificationService.markAllAsRead(req.user!.userId);
  res.json(success(result, "All notifications marked as read"));
}
