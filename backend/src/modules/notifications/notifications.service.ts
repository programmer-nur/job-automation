import type { Notification, Prisma } from '@prisma/client';

import { AppError } from '@/common/errors';
import { notificationRepository } from '@/modules/notifications/notifications.repository';
import type {
  CreateNotificationInput,
  NotificationListParams,
  NotificationResponse,
} from '@/modules/notifications/notifications.types';
import { getPaginationParams, getPaginationMeta } from '@/utils/pagination';

function toNotificationResponse(n: Notification): NotificationResponse {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    type: n.type,
    isRead: n.isRead,
    createdAt: n.createdAt,
    updatedAt: n.updatedAt,
  };
}

export const notificationService = {
  async create(userId: string, input: CreateNotificationInput) {
    const data: Prisma.NotificationCreateInput = {
      user: { connect: { id: userId } },
      title: input.title,
      message: input.message,
      type: input.type,
    };

    const notification = await notificationRepository.create(data);
    return toNotificationResponse(notification);
  },

  async list(userId: string, params: NotificationListParams) {
    const { skip, take } = getPaginationParams(params.page, params.limit);

    const where: Prisma.NotificationWhereInput = { userId };

    if (params.isRead !== undefined) {
      where.isRead = params.isRead;
    }

    const orderBy: Prisma.NotificationOrderByWithRelationInput = {
      [params.sortBy || 'createdAt']: params.sortOrder || 'desc',
    };

    const [notifications, total] = await Promise.all([
      notificationRepository.findAll({ where, orderBy, skip, take }),
      notificationRepository.count(where),
    ]);

    return {
      data: notifications.map(toNotificationResponse),
      meta: getPaginationMeta(total, params.page, take),
    };
  },

  async getById(userId: string, id: string) {
    const notification = await notificationRepository.findById(userId, id);
    if (!notification) {
      throw AppError.notFound('Notification');
    }
    return toNotificationResponse(notification);
  },

  async markAsRead(userId: string, id: string) {
    const existing = await notificationRepository.findById(userId, id);
    if (!existing) {
      throw AppError.notFound('Notification');
    }

    const notification = await notificationRepository.update(id, { isRead: true });
    return toNotificationResponse(notification);
  },

  async markAllAsRead(userId: string) {
    await notificationRepository.updateMany({ userId, isRead: false }, { isRead: true });
  },
};
