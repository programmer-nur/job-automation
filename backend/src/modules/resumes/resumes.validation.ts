import { z } from 'zod';

import { MAX_PAGE_SIZE } from '@/modules/resumes/resumes.constants';

export const createResumeSchema = z.object({
  title: z.string().max(255).optional(),
  content: z.string().min(1, 'Content is required').max(50000),
  fileUrl: z.string().url('Invalid URL').max(2048).optional(),
});

export const updateResumeSchema = z.object({
  title: z.string().max(255).optional(),
  content: z.string().min(1).max(50000).optional(),
  fileUrl: z.string().url('Invalid URL').max(2048).optional(),
});

export const tailorResumeSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
});

export const resumeListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
  isActive: z.coerce.boolean().optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
