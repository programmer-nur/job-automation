import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';

export const coverLetterRepository = {
  async create(data: Prisma.CoverLetterCreateInput) {
    return prisma.coverLetter.create({ data });
  },

  async findById(userId: string, id: string) {
    return prisma.coverLetter.findFirst({
      where: { id, userId, deletedAt: null },
    });
  },

  async findAll(params: {
    where: Prisma.CoverLetterWhereInput;
    orderBy: Prisma.CoverLetterOrderByWithRelationInput;
    skip: number;
    take: number;
  }) {
    return prisma.coverLetter.findMany(params);
  },

  async count(where: Prisma.CoverLetterWhereInput) {
    return prisma.coverLetter.count({ where });
  },

  async update(id: string, data: Prisma.CoverLetterUpdateInput) {
    return prisma.coverLetter.update({ where: { id }, data });
  },

  async softDelete(id: string) {
    return prisma.coverLetter.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  },
};
