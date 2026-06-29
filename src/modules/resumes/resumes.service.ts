import type { Prisma } from "@prisma/client";
import { AppError } from "@/common/errors.js";
import { getPaginationMeta, getPaginationParams } from "@/utils/pagination.js";
import * as resumeRepository from "./resumes.repository.js";
import * as jobRepository from "@/modules/jobs/jobs.repository.js";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "./resumes.constants.js";
import { toResumeResponse, type CreateResumeInput, type ResumeListParams, type UpdateResumeInput } from "./resumes.types.js";

export async function createResume(userId: string, input: CreateResumeInput) {
  const resume = await resumeRepository.createResume({
    userId,
    name: input.name,
    targetRole: input.targetRole ?? null,
    storageUrl: input.storageUrl ?? null,
  });

  return toResumeResponse(resume);
}

export async function listResumes(userId: string, params: ResumeListParams) {
  const { skip, take } = getPaginationParams(params.page, params.limit);

  const where: Prisma.ResumeVersionWhereInput = { userId, deletedAt: null };

  if (params.isDefault !== undefined) where.isDefault = params.isDefault;

  const orderBy: Prisma.ResumeVersionOrderByWithRelationInput = {
    [params.sortBy ?? "createdAt"]: params.sortOrder ?? "desc",
  };

  const [resumes, total] = await Promise.all([
    resumeRepository.findResumes({ where, orderBy, skip, take }),
    resumeRepository.countResumes(where),
  ]);

  return {
    data: resumes.map(toResumeResponse),
    meta: getPaginationMeta(total, params.page, take),
  };
}

export async function getResume(userId: string, id: string) {
  const resume = await resumeRepository.findResumeById(id, userId);
  if (!resume) throw AppError.notFound("Resume");
  return toResumeResponse(resume);
}

export async function updateResume(userId: string, id: string, input: UpdateResumeInput) {
  const existing = await resumeRepository.findResumeById(id, userId);
  if (!existing) throw AppError.notFound("Resume");

  const data: Record<string, unknown> = {};
  if ("name" in input) data.name = input.name;
  if ("targetRole" in input) data.targetRole = input.targetRole ?? null;
  if ("storageUrl" in input) data.storageUrl = input.storageUrl ?? null;

  const resume = await resumeRepository.updateResume(id, data as Prisma.ResumeVersionUpdateInput);
  return toResumeResponse(resume);
}

export async function deleteResume(userId: string, id: string) {
  const existing = await resumeRepository.findResumeById(id, userId);
  if (!existing) throw AppError.notFound("Resume");
  await resumeRepository.softDeleteResume(id);
}

export async function setActiveResume(userId: string, id: string) {
  const existing = await resumeRepository.findResumeById(id, userId);
  if (!existing) throw AppError.notFound("Resume");

  await resumeRepository.deactivateAllResumes(userId);
  const resume = await resumeRepository.updateResume(id, { isDefault: true });
  return toResumeResponse(resume);
}

export async function tailorResume(userId: string, id: string, jobId: string) {
  const resume = await resumeRepository.findResumeById(id, userId);
  if (!resume) throw AppError.notFound("Resume");

  const job = await jobRepository.findJobById(jobId, userId);
  if (!job) throw AppError.notFound("Job");

  throw new AppError(501, "AI resume tailoring is not yet implemented", "NOT_IMPLEMENTED");
}
