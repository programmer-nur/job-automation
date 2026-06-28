import type { Prisma } from '@prisma/client';

import { prisma } from '@/config/prisma';

export const aiRepository = {
  async create(data: Prisma.AIRequestCreateInput) {
    return prisma.aIRequest.create({ data });
  },

  async update(id: string, data: Prisma.AIRequestUpdateInput) {
    return prisma.aIRequest.update({ where: { id }, data });
  },
};
