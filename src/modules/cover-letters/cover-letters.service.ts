import type { Prisma } from "@prisma/client";
import { AppError } from "@/common/errors.js";
import { getPaginationMeta, getPaginationParams } from "@/utils/pagination.js";
import * as coverLetterRepository from "./cover-letters.repository.js";
import * as jobRepository from "@/modules/jobs/jobs.repository.js";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "./cover-letters.constants.js";
import { toCoverLetterResponse, type CreateCoverLetterInput, type CoverLetterListParams, type UpdateCoverLetterInput } from "./cover-letters.types.js";

export async function createCoverLetter(userId: string, input: CreateCoverLetterInput) {
  const cl = await coverLetterRepository.createCoverLetter({
    userId,
    jobId: input.jobId ?? null,
    content: input.content,
    storageUrl: input.storageUrl ?? null,
  });

  return toCoverLetterResponse(cl);
}

export async function listCoverLetters(userId: string, params: CoverLetterListParams) {
  const { skip, take } = getPaginationParams(params.page, params.limit);

  const where: Prisma.CoverLetterWhereInput = { userId };

  const orderBy: Prisma.CoverLetterOrderByWithRelationInput = {
    [params.sortBy ?? "createdAt"]: params.sortOrder ?? "desc",
  };

  const [letters, total] = await Promise.all([
    coverLetterRepository.findCoverLetters({ where, orderBy, skip, take }),
    coverLetterRepository.countCoverLetters(where),
  ]);

  return {
    data: letters.map(toCoverLetterResponse),
    meta: getPaginationMeta(total, params.page, take),
  };
}

export async function getCoverLetter(userId: string, id: string) {
  const cl = await coverLetterRepository.findCoverLetterById(id, userId);
  if (!cl) throw AppError.notFound("Cover letter");
  return toCoverLetterResponse(cl);
}

export async function updateCoverLetter(userId: string, id: string, input: UpdateCoverLetterInput) {
  const existing = await coverLetterRepository.findCoverLetterById(id, userId);
  if (!existing) throw AppError.notFound("Cover letter");

  const data: Record<string, unknown> = {};
  if ("content" in input) data.content = input.content;
  if ("storageUrl" in input) data.storageUrl = input.storageUrl ?? null;

  const cl = await coverLetterRepository.updateCoverLetter(id, data as Prisma.CoverLetterUpdateInput);
  return toCoverLetterResponse(cl);
}

export async function deleteCoverLetter(userId: string, id: string) {
  const existing = await coverLetterRepository.findCoverLetterById(id, userId);
  if (!existing) throw AppError.notFound("Cover letter");
  await coverLetterRepository.deleteCoverLetterById(id);
}

export async function generateCoverLetter(userId: string, input: { jobId: string }) {
  const job = await jobRepository.findJobById(input.jobId, userId);
  if (!job) throw AppError.notFound("Job");

  throw new AppError(501, "AI cover letter generation is not yet implemented", "NOT_IMPLEMENTED");
}
