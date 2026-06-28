import type { Prisma, Task } from '@prisma/client';

import { AppError } from '@/common/errors';
import { taskRepository } from '@/modules/tasks/tasks.repository';
import type {
  CreateTaskInput,
  TaskListParams,
  TaskResponse,
  UpdateTaskInput,
} from '@/modules/tasks/tasks.types';
import { getPaginationParams, getPaginationMeta } from '@/utils/pagination';

function toTaskResponse(task: Task): TaskResponse {
  return {
    id: task.id,
    jobId: task.jobId,
    applicationId: task.applicationId,
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    completedAt: task.completedAt,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

export const taskService = {
  async create(userId: string, input: CreateTaskInput) {
    const data: Prisma.TaskCreateInput = {
      user: { connect: { id: userId } },
      title: input.title,
      description: input.description,
    };

    if (input.dueDate) {
      data.dueDate = new Date(input.dueDate);
    }

    if (input.jobId) {
      data.job = { connect: { id: input.jobId } };
    }

    if (input.applicationId) {
      data.application = { connect: { id: input.applicationId } };
    }

    const task = await taskRepository.create(data);
    return toTaskResponse(task);
  },

  async list(userId: string, params: TaskListParams) {
    const { skip, take } = getPaginationParams(params.page, params.limit);

    const where: Prisma.TaskWhereInput = { userId, deletedAt: null };

    if (params.status === 'completed') {
      where.completedAt = { not: null };
    } else if (params.status === 'pending') {
      where.completedAt = null;
    }

    if (params.jobId) {
      where.jobId = params.jobId;
    }

    if (params.applicationId) {
      where.applicationId = params.applicationId;
    }

    const orderBy: Prisma.TaskOrderByWithRelationInput = {
      [params.sortBy || 'createdAt']: params.sortOrder || 'desc',
    };

    const [tasks, total] = await Promise.all([
      taskRepository.findAll({ where, orderBy, skip, take }),
      taskRepository.count(where),
    ]);

    return {
      data: tasks.map(toTaskResponse),
      meta: getPaginationMeta(total, params.page, take),
    };
  },

  async getById(userId: string, id: string) {
    const task = await taskRepository.findById(userId, id);
    if (!task) {
      throw AppError.notFound('Task');
    }
    return toTaskResponse(task);
  },

  async update(userId: string, id: string, input: UpdateTaskInput) {
    const existing = await taskRepository.findById(userId, id);
    if (!existing) {
      throw AppError.notFound('Task');
    }

    const data: Prisma.TaskUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.description !== undefined) data.description = input.description;
    if (input.dueDate !== undefined) data.dueDate = new Date(input.dueDate);

    const task = await taskRepository.update(id, data);
    return toTaskResponse(task);
  },

  async delete(userId: string, id: string) {
    const existing = await taskRepository.findById(userId, id);
    if (!existing) {
      throw AppError.notFound('Task');
    }

    await taskRepository.softDelete(id);
  },

  async complete(userId: string, id: string) {
    const existing = await taskRepository.findById(userId, id);
    if (!existing) {
      throw AppError.notFound('Task');
    }

    const task = await taskRepository.update(id, { completedAt: new Date() });
    return toTaskResponse(task);
  },

  async incomplete(userId: string, id: string) {
    const existing = await taskRepository.findById(userId, id);
    if (!existing) {
      throw AppError.notFound('Task');
    }

    const task = await taskRepository.update(id, { completedAt: null });
    return toTaskResponse(task);
  },
};
