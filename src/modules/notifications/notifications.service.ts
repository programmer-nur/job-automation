import type { Prisma } from "@prisma/client";
import { AppError } from "@/common/errors.js";
import { getPaginationMeta, getPaginationParams } from "@/utils/pagination.js";
import * as notificationRepository from "./notifications.repository.js";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "./notifications.constants.js";
import { toNotificationResponse, type CreateNotificationInput, type NotificationListParams } from "./notifications.types.js";

export async function createNotification(userId: string, input: CreateNotificationInput) {
  const n = await notificationRepository.createNotification({
    userId,
    title: input.title,
    message: input.message ?? null,
    taskId: input.taskId ?? null,
  });

  return toNotificationResponse(n);
}

export async function listNotifications(userId: string, params: NotificationListParams) {
  const { skip, take } = getPaginationParams(params.page, params.limit);

  const where: Prisma.NotificationWhereInput = { userId };

  if (params.isRead !== undefined) where.isRead = params.isRead;

  const orderBy: Prisma.NotificationOrderByWithRelationInput = { createdAt: "desc" };

  const [notifications, total] = await Promise.all([
    notificationRepository.findNotifications({ where, orderBy, skip, take }),
    notificationRepository.countNotifications(where),
  ]);

  return {
    data: notifications.map(toNotificationResponse),
    meta: getPaginationMeta(total, params.page, take),
  };
}

export async function getNotification(userId: string, id: string) {
  const n = await notificationRepository.findNotificationById(id, userId);
  if (!n) throw AppError.notFound("Notification");
  return toNotificationResponse(n);
}

export async function markAsRead(userId: string, id: string) {
  const n = await notificationRepository.findNotificationById(id, userId);
  if (!n) throw AppError.notFound("Notification");

  const updated = await notificationRepository.updateNotification(id, { isRead: true });
  return toNotificationResponse(updated);
}

export async function markAllAsRead(userId: string) {
  const result = await notificationRepository.markAllNotificationsAsRead(userId);
  return { count: result.count };
}
