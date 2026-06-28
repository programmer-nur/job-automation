import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';

export const jobRepository = {
  async create(data: Prisma.JobCreateInput) {
    return prisma.job.create({ data });
  },

  async findByUserAndUrl(userId: string, url: string) {
    return prisma.job.findFirst({
      where: { userId, url, deletedAt: null },
    });
  },

  async findById(userId: string, id: string) {
    return prisma.job.findFirst({
      where: { id, userId, deletedAt: null },
    });
  },

  async findAll(params: {
    where: Prisma.JobWhereInput;
    orderBy: Prisma.JobOrderByWithRelationInput;
    skip: number;
    take: number;
  }) {
    return prisma.job.findMany(params);
  },

  async count(where: Prisma.JobWhereInput) {
    return prisma.job.count({ where });
  },

  async update(id: string, data: Prisma.JobUpdateInput) {
    return prisma.job.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.job.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
