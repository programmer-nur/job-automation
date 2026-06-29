import { prisma } from "@/services/prisma.js";
import type { Prisma } from "@prisma/client";

export function createJob(data: Omit<Prisma.JobCreateInput, "user"> & { userId: string }) {
  const { userId, ...rest } = data;
  return prisma.job.create({
    data: { ...rest, user: { connect: { id: userId } } },
    include: { jobSkills: true },
  });
}

export function findJobById(id: string, userId: string) {
  return prisma.job.findFirst({
    where: { id, userId, deletedAt: null },
    include: { jobSkills: true },
  });
}

export function findJobs(params: {
  where: Prisma.JobWhereInput;
  orderBy: Prisma.JobOrderByWithRelationInput;
  skip: number;
  take: number;
}) {
  return prisma.job.findMany({
    ...params,
    include: { jobSkills: true },
  });
}

export function countJobs(where: Prisma.JobWhereInput) {
  return prisma.job.count({ where });
}

export function updateJob(id: string, data: Prisma.JobUpdateInput) {
  return prisma.job.update({
    where: { id },
    data,
    include: { jobSkills: true },
  });
}

export function softDeleteJob(id: string) {
  return prisma.job.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export function findJobByUrl(userId: string, jobUrl: string) {
  return prisma.job.findFirst({
    where: { userId, jobUrl, deletedAt: null },
  });
}
