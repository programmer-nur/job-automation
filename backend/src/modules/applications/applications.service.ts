import type { Application, ApplicationStatus, Prisma } from '@prisma/client';

import { AppError } from '@/common/errors';
import { applicationRepository } from '@/modules/applications/applications.repository';
import type {
  ApplicationListParams,
  ApplicationResponse,
  CreateApplicationInput,
  UpdateApplicationInput,
} from '@/modules/applications/applications.types';
import { jobRepository } from '@/modules/jobs/jobs.repository';
import { getPaginationParams, getPaginationMeta } from '@/utils/pagination';

function toApplicationResponse(app: Application): ApplicationResponse {
  return {
    id: app.id,
    jobId: app.jobId,
    status: app.status,
    notes: app.notes,
    followUpDate: app.followUpDate,
    submittedAt: app.submittedAt,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  };
}

export const applicationService = {
  async create(userId: string, input: CreateApplicationInput) {
    const job = await jobRepository.findById(userId, input.jobId);
    if (!job) {
      throw AppError.notFound('Job');
    }

    const data: Prisma.ApplicationCreateInput = {
      user: { connect: { id: userId } },
      job: { connect: { id: input.jobId } },
      status: 'DRAFT',
      notes: input.notes,
    };

    const app = await applicationRepository.create(data);
    return toApplicationResponse(app);
  },

  async list(userId: string, params: ApplicationListParams) {
    const { skip, take } = getPaginationParams(params.page, params.limit);

    const where: Prisma.ApplicationWhereInput = { userId, deletedAt: null };

    if (params.status) {
      where.status = params.status as ApplicationStatus;
    }

    if (params.jobId) {
      where.jobId = params.jobId;
    }

    const orderBy: Prisma.ApplicationOrderByWithRelationInput = {
      [params.sortBy || 'createdAt']: params.sortOrder || 'desc',
    };

    const [apps, total] = await Promise.all([
      applicationRepository.findAll({ where, orderBy, skip, take }),
      applicationRepository.count(where),
    ]);

    return {
      data: apps.map(toApplicationResponse),
      meta: getPaginationMeta(total, params.page, take),
    };
  },

  async getById(userId: string, id: string) {
    const app = await applicationRepository.findById(userId, id);
    if (!app) {
      throw AppError.notFound('Application');
    }
    return toApplicationResponse(app);
  },

  async update(userId: string, id: string, input: UpdateApplicationInput) {
    const existing = await applicationRepository.findById(userId, id);
    if (!existing) {
      throw AppError.notFound('Application');
    }

    const data: Prisma.ApplicationUpdateInput = {};
    if (input.notes !== undefined) {
      data.notes = input.notes;
    }

    const app = await applicationRepository.update(id, data);
    return toApplicationResponse(app);
  },

  async delete(userId: string, id: string) {
    const existing = await applicationRepository.findById(userId, id);
    if (!existing) {
      throw AppError.notFound('Application');
    }

    await applicationRepository.softDelete(id);
  },

  async updateStatus(userId: string, id: string, status: string) {
    const existing = await applicationRepository.findById(userId, id);
    if (!existing) {
      throw AppError.notFound('Application');
    }

    const app = await applicationRepository.update(id, { status: status as ApplicationStatus });
    return toApplicationResponse(app);
  },

  async scheduleFollowUp(userId: string, id: string, followUpDate: Date) {
    const existing = await applicationRepository.findById(userId, id);
    if (!existing) {
      throw AppError.notFound('Application');
    }

    const app = await applicationRepository.update(id, { followUpDate });
    return toApplicationResponse(app);
  },

  async updateNotes(userId: string, id: string, notes: string | null) {
    const existing = await applicationRepository.findById(userId, id);
    if (!existing) {
      throw AppError.notFound('Application');
    }

    const app = await applicationRepository.update(id, { notes });
    return toApplicationResponse(app);
  },
};
