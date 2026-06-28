import type { Job, JobStatus, Prisma } from '@prisma/client';

import { AppError } from '@/common/errors';
import { jobRepository } from '@/modules/jobs/jobs.repository';
import type {
  CreateJobInput,
  JobListParams,
  JobResponse,
  UpdateJobInput,
} from '@/modules/jobs/jobs.types';
import { getPaginationParams, getPaginationMeta } from '@/utils/pagination';

function toJobResponse(job: Job): JobResponse {
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    location: job.location,
    description: job.description,
    url: job.url,
    salaryRange: job.salaryRange,
    jobType: job.jobType,
    source: job.source,
    status: job.status,
    matchScore: job.matchScore,
    isFavorite: job.isFavorite,
    notes: (job.metadata as { notes?: string } | null)?.notes ?? null,
    appliedAt: job.appliedAt,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}

function buildCreateData(userId: string, input: CreateJobInput): Prisma.JobCreateInput {
  const metadata: Record<string, unknown> = {};
  if (input.notes) {
    metadata.notes = input.notes;
  }

  return {
    user: { connect: { id: userId } },
    title: input.title,
    company: input.company,
    location: input.location,
    description: input.description,
    url: input.url,
    salaryRange: input.salaryRange,
    jobType: input.jobType,
    source: input.source,
    metadata: Object.keys(metadata).length > 0 ? (metadata as Prisma.InputJsonValue) : undefined,
  };
}

function buildUpdateData(input: UpdateJobInput, existingJob?: Job | null): Prisma.JobUpdateInput {
  const data: Prisma.JobUpdateInput = {};

  if (input.title !== undefined) data.title = input.title;
  if (input.company !== undefined) data.company = input.company;
  if (input.location !== undefined) data.location = input.location;
  if (input.description !== undefined) data.description = input.description;
  if (input.url !== undefined) data.url = input.url;
  if (input.salaryRange !== undefined) data.salaryRange = input.salaryRange;
  if (input.jobType !== undefined) data.jobType = input.jobType;
  if (input.source !== undefined) data.source = input.source;

  if (input.notes !== undefined) {
    const existingMetadata = (existingJob?.metadata as Record<string, unknown> | null) ?? {};
    data.metadata = { ...existingMetadata, notes: input.notes } as Prisma.InputJsonValue;
  }

  return data;
}

export const jobService = {
  async create(userId: string, input: CreateJobInput) {
    if (input.url) {
      const existing = await jobRepository.findByUserAndUrl(userId, input.url);
      if (existing) {
        throw AppError.conflict('A job with this URL already exists');
      }
    }

    const data = buildCreateData(userId, input);
    const job = await jobRepository.create(data);
    return toJobResponse(job);
  },

  async list(userId: string, params: JobListParams) {
    const { skip, take } = getPaginationParams(params.page, params.limit);

    const where: Prisma.JobWhereInput = { userId, deletedAt: null };

    if (params.status) {
      where.status = params.status as JobStatus;
    }

    if (params.company) {
      where.company = { contains: params.company, mode: 'insensitive' };
    }

    if (params.favorite !== undefined) {
      where.isFavorite = params.favorite;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { company: { contains: params.search, mode: 'insensitive' } },
        { description: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const orderBy: Prisma.JobOrderByWithRelationInput = {
      [params.sortBy || 'createdAt']: params.sortOrder || 'desc',
    };

    const [jobs, total] = await Promise.all([
      jobRepository.findAll({ where, orderBy, skip, take }),
      jobRepository.count(where),
    ]);

    return {
      data: jobs.map(toJobResponse),
      meta: getPaginationMeta(total, params.page, take),
    };
  },

  async getById(userId: string, id: string) {
    const job = await jobRepository.findById(userId, id);
    if (!job) {
      throw AppError.notFound('Job');
    }
    return toJobResponse(job);
  },

  async update(userId: string, id: string, input: UpdateJobInput) {
    const existing = await jobRepository.findById(userId, id);
    if (!existing) {
      throw AppError.notFound('Job');
    }

    const data = buildUpdateData(input, existing);
    const job = await jobRepository.update(id, data);
    return toJobResponse(job);
  },

  async delete(userId: string, id: string) {
    const existing = await jobRepository.findById(userId, id);
    if (!existing) {
      throw AppError.notFound('Job');
    }

    await jobRepository.softDelete(id);
  },

  async updateStatus(userId: string, id: string, status: string) {
    const existing = await jobRepository.findById(userId, id);
    if (!existing) {
      throw AppError.notFound('Job');
    }

    const job = await jobRepository.update(id, { status: status as JobStatus });
    return toJobResponse(job);
  },

  async toggleFavorite(userId: string, id: string, isFavorite: boolean) {
    const existing = await jobRepository.findById(userId, id);
    if (!existing) {
      throw AppError.notFound('Job');
    }

    const job = await jobRepository.update(id, { isFavorite });
    return toJobResponse(job);
  },
};
