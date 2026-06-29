import { z } from "zod";
import { RESUME_SORTABLE_FIELDS, MAX_PAGE_SIZE } from "./resumes.constants.js";

export const createResumeSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  targetRole: z.string().max(255).optional(),
  storageUrl: z.string().url("Invalid URL").max(2048).optional(),
});

export const updateResumeSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  targetRole: z.string().max(255).optional(),
  storageUrl: z.string().url("Invalid URL").max(2048).optional(),
});

export const tailorSchema = z.object({
  jobId: z.string().uuid("Job ID must be a valid UUID"),
});

export const resumeListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
  isDefault: z.coerce.boolean().optional(),
  sortBy: z.enum(RESUME_SORTABLE_FIELDS).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
