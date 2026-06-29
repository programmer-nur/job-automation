import { z } from "zod";
import { COVER_LETTER_SORTABLE_FIELDS, MAX_PAGE_SIZE } from "./cover-letters.constants.js";

export const createCoverLetterSchema = z.object({
  jobId: z.string().uuid("Job ID must be a valid UUID").optional(),
  content: z.string().min(1, "Content is required").max(50000),
  storageUrl: z.string().url("Invalid URL").max(2048).optional(),
});

export const updateCoverLetterSchema = z.object({
  content: z.string().min(1).max(50000).optional(),
  storageUrl: z.string().url("Invalid URL").max(2048).optional(),
});

export const generateCoverLetterSchema = z.object({
  jobId: z.string().uuid("Job ID must be a valid UUID"),
});

export const coverLetterListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
  sortBy: z.enum(COVER_LETTER_SORTABLE_FIELDS).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
