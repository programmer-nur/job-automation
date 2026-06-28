import type { Prisma, ResumeVersion } from '@prisma/client';

import { AppError } from '@/common/errors';
import { jobRepository } from '@/modules/jobs/jobs.repository';
import { resumeRepository } from '@/modules/resumes/resumes.repository';
import type {
  CreateResumeInput,
  ResumeListParams,
  ResumeResponse,
  UpdateResumeInput,
} from '@/modules/resumes/resumes.types';
import { getPaginationParams, getPaginationMeta } from '@/utils/pagination';

function toResumeResponse(resume: ResumeVersion): ResumeResponse {
  return {
    id: resume.id,
    version: resume.version,
    title: resume.title,
    content: resume.content,
    fileUrl: resume.fileUrl,
    matchScore: resume.matchScore,
    isActive: resume.isActive,
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt,
  };
}

export const resumeService = {
  async create(userId: string, input: CreateResumeInput) {
    const { _max } = await resumeRepository.findMaxVersion(userId);
    const nextVersion = (_max?.version ?? 0) + 1;

    const data: Prisma.ResumeVersionCreateInput = {
      user: { connect: { id: userId } },
      version: nextVersion,
      title: input.title,
      content: input.content,
      fileUrl: input.fileUrl,
    };

    const resume = await resumeRepository.create(data);
    return toResumeResponse(resume);
  },

  async list(userId: string, params: ResumeListParams) {
    const { skip, take } = getPaginationParams(params.page, params.limit);

    const where: Prisma.ResumeVersionWhereInput = { userId, deletedAt: null };

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const orderBy: Prisma.ResumeVersionOrderByWithRelationInput = {
      [params.sortBy || 'createdAt']: params.sortOrder || 'desc',
    };

    const [resumes, total] = await Promise.all([
      resumeRepository.findAll({ where, orderBy, skip, take }),
      resumeRepository.count(where),
    ]);

    return {
      data: resumes.map(toResumeResponse),
      meta: getPaginationMeta(total, params.page, take),
    };
  },

  async getById(userId: string, id: string) {
    const resume = await resumeRepository.findById(userId, id);
    if (!resume) {
      throw AppError.notFound('Resume');
    }
    return toResumeResponse(resume);
  },

  async update(userId: string, id: string, input: UpdateResumeInput) {
    const existing = await resumeRepository.findById(userId, id);
    if (!existing) {
      throw AppError.notFound('Resume');
    }

    const data: Prisma.ResumeVersionUpdateInput = {};
    if (input.title !== undefined) data.title = input.title;
    if (input.content !== undefined) data.content = input.content;
    if (input.fileUrl !== undefined) data.fileUrl = input.fileUrl;

    const resume = await resumeRepository.update(id, data);
    return toResumeResponse(resume);
  },

  async delete(userId: string, id: string) {
    const existing = await resumeRepository.findById(userId, id);
    if (!existing) {
      throw AppError.notFound('Resume');
    }

    await resumeRepository.softDelete(id);
  },

  async setActive(userId: string, id: string) {
    const existing = await resumeRepository.findById(userId, id);
    if (!existing) {
      throw AppError.notFound('Resume');
    }

    await resumeRepository.updateMany(
      { userId, isActive: true, deletedAt: null },
      { isActive: false },
    );

    const resume = await resumeRepository.update(id, { isActive: true });
    return toResumeResponse(resume);
  },

  async tailor(userId: string, resumeId: string, jobId: string) {
    const resume = await resumeRepository.findById(userId, resumeId);
    if (!resume) {
      throw AppError.notFound('Resume');
    }

    const job = await jobRepository.findById(userId, jobId);
    if (!job) {
      throw AppError.notFound('Job');
    }

    throw new AppError(501, 'AI resume tailoring is not yet implemented', 'AI_002');
  },
};
