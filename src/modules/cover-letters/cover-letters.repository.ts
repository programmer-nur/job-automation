import { prisma } from "@/services/prisma.js";
import type { Prisma } from "@prisma/client";

export function createCoverLetter(data: {
  userId: string;
  jobId?: string | null;
  content: string;
  storageUrl?: string | null;
}) {
  const { userId, jobId, ...rest } = data;
  return prisma.coverLetter.create({
    data: {
      ...rest,
      ...(jobId ? { job: { connect: { id: jobId } } } : {}),
      user: { connect: { id: userId } },
    },
  });
}

export function findCoverLetterById(id: string, userId: string) {
  return prisma.coverLetter.findFirst({
    where: { id, userId },
  });
}

export function findCoverLetters(params: {
  where: Prisma.CoverLetterWhereInput;
  orderBy: Prisma.CoverLetterOrderByWithRelationInput;
  skip: number;
  take: number;
}) {
  return prisma.coverLetter.findMany(params);
}

export function countCoverLetters(where: Prisma.CoverLetterWhereInput) {
  return prisma.coverLetter.count({ where });
}

export function updateCoverLetter(id: string, data: Prisma.CoverLetterUpdateInput) {
  return prisma.coverLetter.update({
    where: { id },
    data,
  });
}

export function deleteCoverLetterById(id: string) {
  return prisma.coverLetter.delete({ where: { id } });
}
