import { z } from "zod";
import { TASK_SORTABLE_FIELDS, MAX_PAGE_SIZE } from "./tasks.constants.js";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).optional(),
  dueDate: z.string().datetime("Due date must be a valid ISO datetime").optional(),
  applicationId: z.string().uuid("Application ID must be a valid UUID").optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(500).optional(),
  description: z.string().max(5000).optional(),
  dueDate: z.string().datetime("Due date must be a valid ISO datetime").optional(),
});

export const taskListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
  status: z.enum(["pending", "completed"]).optional(),
  applicationId: z.string().uuid("Application ID must be a valid UUID").optional(),
  sortBy: z.enum(TASK_SORTABLE_FIELDS).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
