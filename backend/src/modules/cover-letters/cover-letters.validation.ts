import { z } from 'zod';

import { MAX_PAGE_SIZE } from '@/modules/cover-letters/cover-letters.constants';

export const createCoverLetterSchema = z.object({
  jobId: z.string().uuid().optional(),
  content: z.string().min(1, 'Content is required').max(50000),
  tone: z.string().max(50).optional(),
});

export const updateCoverLetterSchema = z.object({
  content: z.string().min(1).max(50000).optional(),
  tone: z.string().max(50).optional(),
});

export const generateCoverLetterSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  tone: z.string().max(50).optional(),
});

export const coverLetterListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
