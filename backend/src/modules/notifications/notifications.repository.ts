import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';

export const notificationRepository = {
  async create(data: Prisma.NotificationCreateInput) {
    return prisma.notification.create({ data });
  },

  async findById(userId: string, id: string) {
    return prisma.notification.findFirst({
      where: { id, userId },
    });
  },

  async findAll(params: {
    where: Prisma.NotificationWhereInput;
    orderBy: Prisma.NotificationOrderByWithRelationInput;
    skip: number;
    take: number;
  }) {
    return prisma.notification.findMany(params);
  },

  async count(where: Prisma.NotificationWhereInput) {
    return prisma.notification.count({ where });
  },

  async update(id: string, data: Prisma.NotificationUpdateInput) {
    return prisma.notification.update({ where: { id }, data });
  },

  async updateMany(
    where: Prisma.NotificationWhereInput,
    data: Prisma.NotificationUpdateManyMutationInput,
  ) {
    return prisma.notification.updateMany({ where, data });
  },
};
