import { z } from 'zod';

import { TASK_SORTABLE_FIELDS, MAX_PAGE_SIZE } from '@/modules/tasks/tasks.constants';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  description: z.string().max(5000).optional(),
  dueDate: z.string().datetime({ message: 'Invalid date format (use ISO 8601)' }).optional(),
  jobId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional(),
  dueDate: z.string().datetime({ message: 'Invalid date format (use ISO 8601)' }).optional(),
});

export const taskListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
  status: z.enum(['completed', 'pending']).optional(),
  jobId: z.string().uuid().optional(),
  applicationId: z.string().uuid().optional(),
  sortBy: z.enum(TASK_SORTABLE_FIELDS).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
