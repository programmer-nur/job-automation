import type { Prisma } from "@prisma/client";
import { AppError } from "@/common/errors.js";
import { getPaginationMeta, getPaginationParams } from "@/utils/pagination.js";
import * as taskRepository from "./tasks.repository.js";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "./tasks.constants.js";
import { toTaskResponse, type CreateTaskInput, type TaskListParams, type UpdateTaskInput } from "./tasks.types.js";

export async function createTask(userId: string, input: CreateTaskInput) {
  const task = await taskRepository.createTask({
    userId,
    title: input.title,
    description: input.description ?? null,
    dueDate: input.dueDate ? new Date(input.dueDate) : null,
    applicationId: input.applicationId ?? null,
  });

  return toTaskResponse(task);
}

export async function listTasks(userId: string, params: TaskListParams) {
  const { skip, take } = getPaginationParams(params.page, params.limit);

  const where: Prisma.TaskWhereInput = { userId };

  if (params.status === "completed") where.completed = true;
  if (params.status === "pending") where.completed = false;
  if (params.applicationId) where.applicationId = params.applicationId;

  const orderBy: Prisma.TaskOrderByWithRelationInput = {
    [params.sortBy ?? "createdAt"]: params.sortOrder ?? "desc",
  };

  const [tasks, total] = await Promise.all([
    taskRepository.findTasks({ where, orderBy, skip, take }),
    taskRepository.countTasks(where),
  ]);

  return {
    data: tasks.map(toTaskResponse),
    meta: getPaginationMeta(total, params.page, take),
  };
}

export async function getTask(userId: string, id: string) {
  const task = await taskRepository.findTaskById(id, userId);
  if (!task) throw AppError.notFound("Task");
  return toTaskResponse(task);
}

export async function updateTask(userId: string, id: string, input: UpdateTaskInput) {
  const existing = await taskRepository.findTaskById(id, userId);
  if (!existing) throw AppError.notFound("Task");

  const data: Record<string, unknown> = {};
  if ("title" in input) data.title = input.title;
  if ("description" in input) data.description = input.description ?? null;
  if ("dueDate" in input) data.dueDate = input.dueDate ? new Date(input.dueDate) : null;

  const task = await taskRepository.updateTask(id, data as Prisma.TaskUpdateInput);
  return toTaskResponse(task);
}

export async function completeTask(userId: string, id: string) {
  const existing = await taskRepository.findTaskById(id, userId);
  if (!existing) throw AppError.notFound("Task");

  const task = await taskRepository.updateTask(id, {
    completed: true,
    completedAt: new Date(),
  });
  return toTaskResponse(task);
}

export async function incompleteTask(userId: string, id: string) {
  const existing = await taskRepository.findTaskById(id, userId);
  if (!existing) throw AppError.notFound("Task");

  const task = await taskRepository.updateTask(id, {
    completed: false,
    completedAt: null,
  });
  return toTaskResponse(task);
}

export async function deleteTask(userId: string, id: string) {
  const existing = await taskRepository.findTaskById(id, userId);
  if (!existing) throw AppError.notFound("Task");

  await taskRepository.deleteTaskById(id);
}
