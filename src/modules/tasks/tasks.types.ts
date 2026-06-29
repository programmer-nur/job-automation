import type { Task } from "@prisma/client";

export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  applicationId?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  dueDate?: string;
}

export interface TaskListParams {
  page: number;
  limit: number;
  status?: string;
  applicationId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TaskResponse {
  id: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
}

export function toTaskResponse(task: Task): TaskResponse {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    dueDate: task.dueDate,
    completed: task.completed,
    completedAt: task.completedAt,
    createdAt: task.createdAt,
  };
}
