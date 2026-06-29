import { prisma } from "@/services/prisma.js";
import type { Prisma } from "@prisma/client";

export function createApplication(data: {
  userId: string;
  jobId: string;
  notes: string | null;
}) {
  const { userId, jobId, notes } = data;
  return prisma.application.create({
    data: {
      notes,
      user: { connect: { id: userId } },
      job: { connect: { id: jobId } },
    },
    include: APPLICATION_INCLUDE,
  });
}

const APPLICATION_INCLUDE = {
  job: {
    select: { id: true, title: true, company: true, location: true },
  },
} satisfies Prisma.ApplicationInclude;

export function findApplicationById(id: string, userId: string) {
  return prisma.application.findFirst({
    where: { id, userId, deletedAt: null },
    include: APPLICATION_INCLUDE,
  });
}

export function findApplications(params: {
  where: Prisma.ApplicationWhereInput;
  orderBy: Prisma.ApplicationOrderByWithRelationInput;
  skip: number;
  take: number;
}) {
  return prisma.application.findMany({
    ...params,
    include: APPLICATION_INCLUDE,
  });
}

export function countApplications(where: Prisma.ApplicationWhereInput) {
  return prisma.application.count({ where });
}

export function updateApplication(id: string, data: Prisma.ApplicationUpdateInput) {
  return prisma.application.update({
    where: { id },
    data,
    include: APPLICATION_INCLUDE,
  });
}

export function softDeleteApplication(id: string) {
  return prisma.application.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export function findApplicationByJobId(jobId: string, userId: string) {
  return prisma.application.findFirst({
    where: { jobId, userId, deletedAt: null },
  });
}
