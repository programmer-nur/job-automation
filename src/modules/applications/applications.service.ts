import type { Prisma } from "@prisma/client";
import { AppError } from "@/common/errors.js";
import { getPaginationMeta, getPaginationParams } from "@/utils/pagination.js";
import * as applicationRepository from "./applications.repository.js";
import * as jobRepository from "@/modules/jobs/jobs.repository.js";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "./applications.constants.js";
import { toApplicationResponse } from "./applications.types.js";
import type { CreateApplicationInput, ApplicationListParams, UpdateApplicationInput } from "./applications.types.js";

export async function createApplication(userId: string, input: CreateApplicationInput) {
  const job = await jobRepository.findJobById(input.jobId, userId);
  if (!job) {
    throw AppError.notFound("Job");
  }

  const application = await applicationRepository.createApplication({
    userId,
    jobId: input.jobId,
    notes: input.notes ?? null,
  });

  return toApplicationResponse(application);
}

export async function listApplications(userId: string, params: ApplicationListParams) {
  const { skip, take } = getPaginationParams(params.page, params.limit);

  const where: Prisma.ApplicationWhereInput = { userId, deletedAt: null };

  if (params.status) where.status = params.status as Prisma.EnumJobStatusFilter["equals"];
  if (params.jobId) where.jobId = params.jobId;

  const orderBy: Prisma.ApplicationOrderByWithRelationInput = {
    [params.sortBy ?? "createdAt"]: params.sortOrder ?? "desc",
  };

  const [applications, total] = await Promise.all([
    applicationRepository.findApplications({ where, orderBy, skip, take }),
    applicationRepository.countApplications(where),
  ]);

  return {
    data: applications.map(toApplicationResponse),
    meta: getPaginationMeta(total, params.page, take),
  };
}

export async function getApplication(userId: string, id: string) {
  const application = await applicationRepository.findApplicationById(id, userId);
  if (!application) throw AppError.notFound("Application");

  return toApplicationResponse(application);
}

export async function updateApplication(userId: string, id: string, input: UpdateApplicationInput) {
  const existing = await applicationRepository.findApplicationById(id, userId);
  if (!existing) throw AppError.notFound("Application");

  const data: Record<string, unknown> = {};

  if ("notes" in input) {
    data.notes = input.notes ?? null;
  }

  const application = await applicationRepository.updateApplication(id, data as Prisma.ApplicationUpdateInput);
  return toApplicationResponse(application);
}

export async function deleteApplication(userId: string, id: string) {
  const existing = await applicationRepository.findApplicationById(id, userId);
  if (!existing) throw AppError.notFound("Application");

  await applicationRepository.softDeleteApplication(id);
}

export async function updateApplicationStatus(userId: string, id: string, status: string) {
  const existing = await applicationRepository.findApplicationById(id, userId);
  if (!existing) throw AppError.notFound("Application");

  const application = await applicationRepository.updateApplication(id, { status } as Prisma.ApplicationUpdateInput);
  return toApplicationResponse(application);
}

export async function scheduleFollowUp(userId: string, id: string, followUpDate: string) {
  const existing = await applicationRepository.findApplicationById(id, userId);
  if (!existing) throw AppError.notFound("Application");

  const application = await applicationRepository.updateApplication(id, {
    followUpDate: new Date(followUpDate),
  });

  return toApplicationResponse(application);
}

export async function updateApplicationNotes(userId: string, id: string, notes: string | undefined) {
  const existing = await applicationRepository.findApplicationById(id, userId);
  if (!existing) throw AppError.notFound("Application");

  const application = await applicationRepository.updateApplication(id, { notes: notes ?? null });
  return toApplicationResponse(application);
}
