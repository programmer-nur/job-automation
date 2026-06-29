import { z } from "zod";
import { JOB_SORTABLE_FIELDS, MAX_PAGE_SIZE } from "./jobs.constants.js";

const employmentTypeEnum = z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP", "FREELANCE"]);
const workplaceTypeEnum = z.enum(["REMOTE", "HYBRID", "ONSITE"]);
const jobStatusEnum = z.enum([
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
const priorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const createJobSchema = z.object({
  role: z.string().min(1, "Role is required").max(255),
  company: z.string().min(1, "Company is required").max(255),
  location: z.string().max(255).optional(),
  employmentType: employmentTypeEnum.optional(),
  workplaceType: workplaceTypeEnum.optional(),
  salaryMin: z.number().int().nonnegative().optional(),
  salaryMax: z.number().int().nonnegative().optional(),
  currency: z.string().max(10).optional(),
  source: z.string().max(100).optional(),
  jobUrl: z.string().url("Invalid URL").max(2048).optional(),
  description: z.string().max(10000).optional(),
  requirements: z.string().max(10000).optional(),
  benefits: z.string().max(5000).optional(),
  experienceRequired: z.string().max(500).optional(),
  education: z.string().max(500).optional(),
  notes: z.string().max(5000).optional(),
});

export const updateJobSchema = createJobSchema.partial();

export const jobStatusSchema = z.object({
  status: jobStatusEnum,
});

export const favoriteSchema = z.object({
  isFavorite: z.boolean(),
});

export const jobListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(MAX_PAGE_SIZE).default(20),
  status: jobStatusEnum.optional(),
  company: z.string().max(255).optional(),
  search: z.string().max(255).optional(),
  favorite: z.coerce.boolean().optional(),
  sortBy: z.enum(JOB_SORTABLE_FIELDS).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});
