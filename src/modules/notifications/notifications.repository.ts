import { prisma } from "@/services/prisma.js";
import type { Prisma } from "@prisma/client";

export function createNotification(data: {
  userId: string;
  title: string;
  message?: string | null;
  taskId?: string | null;
}) {
  const { userId, taskId, ...rest } = data;
  return prisma.notification.create({
    data: {
      ...rest,
      ...(taskId ? { task: { connect: { id: taskId } } } : {}),
      user: { connect: { id: userId } },
    },
  });
}

export function findNotificationById(id: string, userId: string) {
  return prisma.notification.findFirst({
    where: { id, userId },
  });
}

export function findNotifications(params: {
  where: Prisma.NotificationWhereInput;
  orderBy: Prisma.NotificationOrderByWithRelationInput;
  skip: number;
  take: number;
}) {
  return prisma.notification.findMany(params);
}

export function countNotifications(where: Prisma.NotificationWhereInput) {
  return prisma.notification.count({ where });
}

export function updateNotification(id: string, data: Prisma.NotificationUpdateInput) {
  return prisma.notification.update({ where: { id }, data });
}

export function markAllNotificationsAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}
