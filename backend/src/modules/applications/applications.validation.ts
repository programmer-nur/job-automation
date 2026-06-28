import { ApplicationStatus } from '@prisma/client';
import { z } from 'zod';

import {
  APPLICATION_SORTABLE_FIELDS,
  MAX_PAGE_SIZE,
} from '@/modules/applications/applications.constants';

export const createApplicationSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  notes: z.string().max(5000).optional(),
});

export const updateApplicationSchema = z.object({
  notes: z.string().max(5000).optional(),
});

export const applicationStatusSchema = z.object({
  status: z.nativeEnum(ApplicationStatus, {
    errorMap: () => ({ message: 'Invalid application status' }),
  }),
});

export const followUpSchema = z.object({
  followUpDate: z.string().datetime({ message: 'Invalid date format (use ISO 8601)' }),
});

export const notesSchema = z.object({
  notes: z.string().max(5000).nullable(),
});

export const applicationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
  status: z.nativeEnum(ApplicationStatus).optional(),
  jobId: z.string().uuid().optional(),
  sortBy: z.enum(APPLICATION_SORTABLE_FIELDS).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
