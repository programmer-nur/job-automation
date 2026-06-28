export interface CreateTaskInput {
  title: string;
  description?: string;
  dueDate?: string;
  jobId?: string;
  applicationId?: string;
}

export type UpdateTaskInput = Pick<Partial<CreateTaskInput>, 'title' | 'description' | 'dueDate'>;

export interface TaskResponse {
  id: string;
  jobId: string | null;
  applicationId: string | null;
  title: string;
  description: string | null;
  dueDate: string | Date | null;
  completedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface TaskListParams {
  page: number;
  limit: number;
  status?: 'completed' | 'pending';
  jobId?: string;
  applicationId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}
