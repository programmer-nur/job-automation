import { z } from "zod";
import { APPLICATION_SORTABLE_FIELDS, MAX_PAGE_SIZE } from "./applications.constants.js";

export const jobStatusEnum = z.enum([
  "NEW",
  "REVIEWING",
  "READY_TO_APPLY",
  "APPLIED",
  "FOLLOW_UP",
  "INTERVIEW",
  "OFFER",
  "REJECTED",
  "CLOSED",
]);

export const createApplicationSchema = z.object({
  jobId: z.string().uuid("Job ID must be a valid UUID"),
  notes: z.string().max(5000, "Notes must be at most 5000 characters").optional(),
});

export const updateApplicationSchema = z.object({
  notes: z.string().max(5000, "Notes must be at most 5000 characters").optional(),
});

export const applicationStatusSchema = z.object({
  status: jobStatusEnum,
});

export const followUpSchema = z.object({
  followUpDate: z.string().datetime("Follow-up date must be a valid ISO datetime"),
});

export const notesSchema = z.object({
  notes: z.string().max(5000, "Notes must be at most 5000 characters").optional(),
});

export const applicationListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
  status: jobStatusEnum.optional(),
  jobId: z.string().uuid("Job ID must be a valid UUID").optional(),
  sortBy: z.enum(APPLICATION_SORTABLE_FIELDS).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
