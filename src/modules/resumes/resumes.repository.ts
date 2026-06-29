import { prisma } from "@/services/prisma.js";
import type { Prisma } from "@prisma/client";

export function createResume(data: { userId: string; name: string; targetRole?: string | null; storageUrl?: string | null }) {
  const { userId, ...rest } = data;
  return prisma.resumeVersion.create({
    data: { ...rest, user: { connect: { id: userId } } },
  });
}

export function findResumeById(id: string, userId: string) {
  return prisma.resumeVersion.findFirst({
    where: { id, userId, deletedAt: null },
  });
}

export function findResumes(params: {
  where: Prisma.ResumeVersionWhereInput;
  orderBy: Prisma.ResumeVersionOrderByWithRelationInput;
  skip: number;
  take: number;
}) {
  return prisma.resumeVersion.findMany(params);
}

export function countResumes(where: Prisma.ResumeVersionWhereInput) {
  return prisma.resumeVersion.count({ where });
}

export function updateResume(id: string, data: Prisma.ResumeVersionUpdateInput) {
  return prisma.resumeVersion.update({
    where: { id },
    data,
  });
}

export function softDeleteResume(id: string) {
  return prisma.resumeVersion.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export function deactivateAllResumes(userId: string) {
  return prisma.resumeVersion.updateMany({
    where: { userId, deletedAt: null },
    data: { isDefault: false },
  });
}
