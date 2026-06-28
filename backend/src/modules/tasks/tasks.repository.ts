import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';

export const taskRepository = {
  async create(data: Prisma.TaskCreateInput) {
    return prisma.task.create({ data });
  },

  async findById(userId: string, id: string) {
    return prisma.task.findFirst({
      where: { id, userId, deletedAt: null },
    });
  },

  async findAll(params: {
    where: Prisma.TaskWhereInput;
    orderBy: Prisma.TaskOrderByWithRelationInput;
    skip: number;
    take: number;
  }) {
    return prisma.task.findMany(params);
  },

  async count(where: Prisma.TaskWhereInput) {
    return prisma.task.count({ where });
  },

  async update(id: string, data: Prisma.TaskUpdateInput) {
    return prisma.task.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
