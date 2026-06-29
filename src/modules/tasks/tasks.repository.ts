import { prisma } from "@/services/prisma.js";
import type { Prisma } from "@prisma/client";

export function createTask(data: {
  userId: string;
  title: string;
  description?: string | null;
  dueDate?: Date | null;
  applicationId?: string | null;
}) {
  const { userId, applicationId, ...rest } = data;
  return prisma.task.create({
    data: {
      ...rest,
      ...(applicationId ? { application: { connect: { id: applicationId } } } : {}),
      user: { connect: { id: userId } },
    },
  });
}

export function findTaskById(id: string, userId: string) {
  return prisma.task.findFirst({
    where: { id, userId },
  });
}

export function findTasks(params: {
  where: Prisma.TaskWhereInput;
  orderBy: Prisma.TaskOrderByWithRelationInput;
  skip: number;
  take: number;
}) {
  return prisma.task.findMany(params);
}

export function countTasks(where: Prisma.TaskWhereInput) {
  return prisma.task.count({ where });
}

export function updateTask(id: string, data: Prisma.TaskUpdateInput) {
  return prisma.task.update({ where: { id }, data });
}

export function deleteTaskById(id: string) {
  return prisma.task.delete({ where: { id } });
}
