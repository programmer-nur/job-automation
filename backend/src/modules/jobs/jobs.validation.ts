import { JobStatus } from '@prisma/client';
import { z } from 'zod';

import { JOB_SORTABLE_FIELDS, MAX_PAGE_SIZE } from '@/modules/jobs/jobs.constants';

export const createJobSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  company: z.string().min(1, 'Company is required').max(255),
  location: z.string().max(255).optional(),
  description: z.string().max(10000).optional(),
  url: z.string().url('Invalid URL').max(2048).optional(),
  salaryRange: z.string().max(100).optional(),
  jobType: z.string().max(100).optional(),
  source: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
});

export const updateJobSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  company: z.string().min(1).max(255).optional(),
  location: z.string().max(255).optional(),
  description: z.string().max(10000).optional(),
  url: z.string().url('Invalid URL').max(2048).optional(),
  salaryRange: z.string().max(100).optional(),
  jobType: z.string().max(100).optional(),
  source: z.string().max(100).optional(),
  notes: z.string().max(5000).optional(),
});

export const jobStatusSchema = z.object({
  status: z.nativeEnum(JobStatus, { errorMap: () => ({ message: 'Invalid job status' }) }),
});

export const favoriteSchema = z.object({
  isFavorite: z.boolean({
    required_error: 'isFavorite is required',
    invalid_type_error: 'isFavorite must be a boolean',
  }),
});

export const jobListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
  status: z.nativeEnum(JobStatus).optional(),
  company: z.string().max(255).optional(),
  search: z.string().max(500).optional(),
  favorite: z.coerce.boolean().optional(),
  sortBy: z.enum(JOB_SORTABLE_FIELDS).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
