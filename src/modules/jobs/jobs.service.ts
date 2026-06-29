import { EmploymentType, WorkplaceType, type Prisma } from "@prisma/client";
import { AppError } from "@/common/errors.js";
import { getPaginationMeta, getPaginationParams } from "@/utils/pagination.js";
import * as jobRepository from "./jobs.repository.js";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "./jobs.constants.js";
import { toJobResponse } from "./jobs.types.js";
import type { CreateJobInput, JobListParams, UpdateJobInput } from "./jobs.types.js";

export async function createJob(userId: string, input: CreateJobInput) {
  if (input.jobUrl) {
    const existing = await jobRepository.findJobByUrl(userId, input.jobUrl);
    if (existing) {
      throw AppError.conflict("A job with this URL already exists");
    }
  }

  const metadata: Record<string, unknown> = {};
  if (input.notes) metadata.notes = input.notes;

  const job = await jobRepository.createJob({
    userId,
    role: input.role,
    company: input.company,
    location: input.location ?? null,
    employmentType: (input.employmentType as EmploymentType) ?? null,
    workplaceType: (input.workplaceType as WorkplaceType) ?? null,
    salaryMin: input.salaryMin ?? null,
    salaryMax: input.salaryMax ?? null,
    currency: input.currency ?? null,
    source: input.source ?? null,
    jobUrl: input.jobUrl ?? null,
    description: input.description ?? null,
    requirements: input.requirements ?? null,
    benefits: input.benefits ?? null,
    experienceRequired: input.experienceRequired ?? null,
    education: input.education ?? null,
    metadata: Object.keys(metadata).length > 0 ? (metadata as Prisma.InputJsonValue) : undefined,
  });

  return toJobResponse(job);
}

export async function listJobs(userId: string, params: JobListParams) {
  const { skip, take } = getPaginationParams(params.page, params.limit);

  const where: Prisma.JobWhereInput = { userId, deletedAt: null };

  if (params.status) where.status = params.status as Prisma.EnumJobStatusFilter["equals"];
  if (params.company) where.company = { contains: params.company, mode: "insensitive" };
  if (params.favorite !== undefined) where.isFavorite = params.favorite;
  if (params.search) {
    where.OR = [
      { role: { contains: params.search, mode: "insensitive" } },
      { company: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
  }

  const orderBy: Prisma.JobOrderByWithRelationInput = { [params.sortBy ?? "createdAt"]: params.sortOrder ?? "desc" };

  const [jobs, total] = await Promise.all([
    jobRepository.findJobs({ where, orderBy, skip, take }),
    jobRepository.countJobs(where),
  ]);

  return {
    data: jobs.map(toJobResponse),
    meta: getPaginationMeta(total, params.page, take),
  };
}

export async function getJob(userId: string, id: string) {
  const job = await jobRepository.findJobById(id, userId);
  if (!job) throw AppError.notFound("Job");
  return toJobResponse(job);
}

export async function updateJob(userId: string, id: string, input: UpdateJobInput) {
  const existing = await jobRepository.findJobById(id, userId);
  if (!existing) throw AppError.notFound("Job");

  const data: Record<string, unknown> = {};
  const fields = [
    "role", "company", "location", "employmentType", "workplaceType",
    "salaryMin", "salaryMax", "currency", "source", "jobUrl",
    "description", "requirements", "benefits", "experienceRequired", "education",
  ] as const;

  for (const field of fields) {
    if (field in input) {
      data[field] = (input as Record<string, unknown>)[field] ?? null;
    }
  }

  if ("notes" in input) {
    const existingMetadata = (existing.metadata as Record<string, unknown> | null) ?? {};
    data.metadata = { ...existingMetadata, notes: input.notes } as Prisma.InputJsonValue;
  }

  const job = await jobRepository.updateJob(id, data as Prisma.JobUpdateInput);
  return toJobResponse(job);
}

export async function deleteJob(userId: string, id: string) {
  const existing = await jobRepository.findJobById(id, userId);
  if (!existing) throw AppError.notFound("Job");

  await jobRepository.softDeleteJob(id);
}

export async function updateJobStatus(userId: string, id: string, status: string) {
  const existing = await jobRepository.findJobById(id, userId);
  if (!existing) throw AppError.notFound("Job");

  const job = await jobRepository.updateJob(id, { status } as Prisma.JobUpdateInput);
  return toJobResponse(job);
}

export async function toggleFavorite(userId: string, id: string, isFavorite: boolean) {
  const existing = await jobRepository.findJobById(id, userId);
  if (!existing) throw AppError.notFound("Job");

  const job = await jobRepository.updateJob(id, { isFavorite });
  return toJobResponse(job);
}
