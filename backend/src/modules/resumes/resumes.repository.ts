import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';

export const resumeRepository = {
  async create(data: Prisma.ResumeVersionCreateInput) {
    return prisma.resumeVersion.create({ data });
  },

  async findById(userId: string, id: string) {
    return prisma.resumeVersion.findFirst({
      where: { id, userId, deletedAt: null },
    });
  },

  async findAll(params: {
    where: Prisma.ResumeVersionWhereInput;
    orderBy: Prisma.ResumeVersionOrderByWithRelationInput;
    skip: number;
    take: number;
  }) {
    return prisma.resumeVersion.findMany(params);
  },

  async count(where: Prisma.ResumeVersionWhereInput) {
    return prisma.resumeVersion.count({ where });
  },

  async update(id: string, data: Prisma.ResumeVersionUpdateInput) {
    return prisma.resumeVersion.update({ where: { id }, data });
  },

  async updateMany(
    where: Prisma.ResumeVersionWhereInput,
    data: Prisma.ResumeVersionUpdateManyMutationInput,
  ) {
    return prisma.resumeVersion.updateMany({ where, data });
  },

  async softDelete(id: string) {
    return prisma.resumeVersion.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },

  async findMaxVersion(userId: string) {
    return prisma.resumeVersion.aggregate({
      where: { userId, deletedAt: null },
      _max: { version: true },
    });
  },
};
