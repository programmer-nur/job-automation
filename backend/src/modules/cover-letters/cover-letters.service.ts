import type { CoverLetter, Prisma } from '@prisma/client';

import { AppError } from '@/common/errors';
import { coverLetterRepository } from '@/modules/cover-letters/cover-letters.repository';
import type {
  CoverLetterListParams,
  CoverLetterResponse,
  CreateCoverLetterInput,
  UpdateCoverLetterInput,
} from '@/modules/cover-letters/cover-letters.types';
import { jobRepository } from '@/modules/jobs/jobs.repository';
import { getPaginationParams, getPaginationMeta } from '@/utils/pagination';

function toCoverLetterResponse(cl: CoverLetter): CoverLetterResponse {
  return {
    id: cl.id,
    jobId: cl.jobId,
    content: cl.content,
    tone: cl.tone,
    createdAt: cl.createdAt,
    updatedAt: cl.updatedAt,
  };
}

export const coverLetterService = {
  async create(userId: string, input: CreateCoverLetterInput) {
    const data: Prisma.CoverLetterCreateInput = {
      user: { connect: { id: userId } },
      content: input.content,
      tone: input.tone,
    };

    if (input.jobId) {
      data.jobId = input.jobId;
    }

    const cl = await coverLetterRepository.create(data);
    return toCoverLetterResponse(cl);
  },

  async list(userId: string, params: CoverLetterListParams) {
    const { skip, take } = getPaginationParams(params.page, params.limit);

    const where: Prisma.CoverLetterWhereInput = { userId, deletedAt: null };

    const orderBy: Prisma.CoverLetterOrderByWithRelationInput = {
      [params.sortBy || 'createdAt']: params.sortOrder || 'desc',
    };

    const [coverLetters, total] = await Promise.all([
      coverLetterRepository.findAll({ where, orderBy, skip, take }),
      coverLetterRepository.count(where),
    ]);

    return {
      data: coverLetters.map(toCoverLetterResponse),
      meta: getPaginationMeta(total, params.page, take),
    };
  },

  async getById(userId: string, id: string) {
    const cl = await coverLetterRepository.findById(userId, id);
    if (!cl) {
      throw AppError.notFound('Cover letter');
    }
    return toCoverLetterResponse(cl);
  },

  async update(userId: string, id: string, input: UpdateCoverLetterInput) {
    const existing = await coverLetterRepository.findById(userId, id);
    if (!existing) {
      throw AppError.notFound('Cover letter');
    }

    const data: Prisma.CoverLetterUpdateInput = {};
    if (input.content !== undefined) data.content = input.content;
    if (input.tone !== undefined) data.tone = input.tone;

    const cl = await coverLetterRepository.update(id, data);
    return toCoverLetterResponse(cl);
  },

  async delete(userId: string, id: string) {
    const existing = await coverLetterRepository.findById(userId, id);
    if (!existing) {
      throw AppError.notFound('Cover letter');
    }

    await coverLetterRepository.softDelete(id);
  },

  async generate(userId: string, input: { jobId: string; tone?: string }) {
    const job = await jobRepository.findById(userId, input.jobId);
    if (!job) {
      throw AppError.notFound('Job');
    }

    throw new AppError(501, 'AI cover letter generation is not yet implemented', 'AI_003');
  },
};
