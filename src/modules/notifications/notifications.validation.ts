import { z } from "zod";
import { MAX_PAGE_SIZE } from "./notifications.constants.js";

export const createNotificationSchema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  message: z.string().max(5000).optional(),
  taskId: z.string().uuid("Task ID must be a valid UUID").optional(),
});

export const notificationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
  isRead: z.coerce.boolean().optional(),
});
