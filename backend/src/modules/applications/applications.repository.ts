import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';

export const applicationRepository = {
  async create(data: Prisma.ApplicationCreateInput) {
    return prisma.application.create({ data });
  },

  async findById(userId: string, id: string) {
    return prisma.application.findFirst({
      where: { id, userId, deletedAt: null },
    });
  },

  async findAll(params: {
    where: Prisma.ApplicationWhereInput;
    orderBy: Prisma.ApplicationOrderByWithRelationInput;
    skip: number;
    take: number;
  }) {
    return prisma.application.findMany(params);
  },

  async count(where: Prisma.ApplicationWhereInput) {
    return prisma.application.count({ where });
  },

  async update(id: string, data: Prisma.ApplicationUpdateInput) {
    return prisma.application.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.application.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
