import { z } from 'zod';

import {
  NOTIFICATION_SORTABLE_FIELDS,
  MAX_PAGE_SIZE,
} from '@/modules/notifications/notifications.constants';

export const createNotificationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  message: z.string().min(1, 'Message is required').max(5000),
  type: z.string().min(1, 'Type is required').max(50),
});

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
  isRead: z.coerce.boolean().optional(),
  sortBy: z.enum(NOTIFICATION_SORTABLE_FIELDS).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
