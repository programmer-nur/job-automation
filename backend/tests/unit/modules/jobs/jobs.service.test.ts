import { describe, expect, it, vi, beforeEach } from 'vitest';

import { jobService } from '@/modules/jobs/jobs.service';

const mockPrismaJob = vi.hoisted(() => ({
  create: vi.fn(),
  findFirst: vi.fn(),
  findMany: vi.fn(),
  count: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/config/prisma', () => ({
  prisma: {
    job: mockPrismaJob,
  },
}));

const mockJob = {
  id: 'job-1',
  userId: 'user-1',
  title: 'Software Engineer',
  company: 'Google',
  location: 'Mountain View, CA',
  description: 'Great job',
  url: 'https://careers.google.com/123',
  salaryRange: '$150k',
  jobType: 'FULL_TIME',
  source: 'linkedin',
  status: 'SAVED',
  matchScore: null,
  isFavorite: false,
  metadata: null,
  appliedAt: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  deletedAt: null,
};

describe('jobService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('creates a job and returns it', async () => {
      mockPrismaJob.findFirst.mockResolvedValue(null);
      mockPrismaJob.create.mockResolvedValue(mockJob);

      const result = await jobService.create('user-1', {
        title: 'Software Engineer',
        company: 'Google',
      });

      expect(result).toMatchObject({
        title: 'Software Engineer',
        company: 'Google',
        status: 'SAVED',
      });
      expect(mockPrismaJob.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user: { connect: { id: 'user-1' } },
          title: 'Software Engineer',
          company: 'Google',
        }),
      });
    });

    it('stores notes in metadata', async () => {
      mockPrismaJob.findFirst.mockResolvedValue(null);
      mockPrismaJob.create.mockResolvedValue({
        ...mockJob,
        metadata: { notes: 'Talk to recruiter' },
      });

      const result = await jobService.create('user-1', {
        title: 'Engineer',
        company: 'Acme',
        notes: 'Talk to recruiter',
      });

      expect(mockPrismaJob.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            metadata: { notes: 'Talk to recruiter' },
          }),
        }),
      );
      expect(result.notes).toBe('Talk to recruiter');
    });

    it('throws 409 for duplicate URL', async () => {
      mockPrismaJob.findFirst.mockResolvedValue(mockJob);

      await expect(
        jobService.create('user-1', {
          title: 'Duplicate',
          company: 'Google',
          url: 'https://careers.google.com/123',
        }),
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('skips duplicate check when no URL', async () => {
      mockPrismaJob.create.mockResolvedValue(mockJob);

      const result = await jobService.create('user-1', {
        title: 'Engineer',
        company: 'Acme',
      });

      expect(mockPrismaJob.findFirst).not.toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe('list', () => {
    const mockJobList = [mockJob];

    it('returns paginated results', async () => {
      mockPrismaJob.findMany.mockResolvedValue(mockJobList);
      mockPrismaJob.count.mockResolvedValue(1);

      const result = await jobService.list('user-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
      expect(mockPrismaJob.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1', deletedAt: null },
          skip: 0,
          take: 20,
        }),
      );
    });

    it('filters by status', async () => {
      mockPrismaJob.findMany.mockResolvedValue([]);
      mockPrismaJob.count.mockResolvedValue(0);

      await jobService.list('user-1', { page: 1, limit: 20, status: 'SAVED' });

      expect(mockPrismaJob.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'SAVED' }),
        }),
      );
    });

    it('filters by favorite', async () => {
      mockPrismaJob.findMany.mockResolvedValue([]);
      mockPrismaJob.count.mockResolvedValue(0);

      await jobService.list('user-1', { page: 1, limit: 20, favorite: true });

      expect(mockPrismaJob.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isFavorite: true }),
        }),
      );
    });

    it('filters by company search', async () => {
      mockPrismaJob.findMany.mockResolvedValue([]);
      mockPrismaJob.count.mockResolvedValue(0);

      await jobService.list('user-1', { page: 1, limit: 20, company: 'Google' });

      expect(mockPrismaJob.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            company: { contains: 'Google', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('performs full-text search', async () => {
      mockPrismaJob.findMany.mockResolvedValue([]);
      mockPrismaJob.count.mockResolvedValue(0);

      await jobService.list('user-1', { page: 1, limit: 20, search: 'engineer' });

      expect(mockPrismaJob.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { title: { contains: 'engineer', mode: 'insensitive' } },
              { company: { contains: 'engineer', mode: 'insensitive' } },
              { description: { contains: 'engineer', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });

    it('sorts by specified field', async () => {
      mockPrismaJob.findMany.mockResolvedValue([]);
      mockPrismaJob.count.mockResolvedValue(0);

      await jobService.list('user-1', { page: 1, limit: 20, sortBy: 'company', sortOrder: 'asc' });

      expect(mockPrismaJob.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { company: 'asc' },
        }),
      );
    });
  });

  describe('getById', () => {
    it('returns job when found', async () => {
      mockPrismaJob.findFirst.mockResolvedValue(mockJob);

      const result = await jobService.getById('user-1', 'job-1');

      expect(result).toMatchObject({ id: 'job-1', title: 'Software Engineer' });
    });

    it('throws 404 when not found', async () => {
      mockPrismaJob.findFirst.mockResolvedValue(null);

      await expect(jobService.getById('user-1', 'nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('update', () => {
    it('updates and returns the job', async () => {
      mockPrismaJob.findFirst.mockResolvedValue(mockJob);
      mockPrismaJob.update.mockResolvedValue({ ...mockJob, title: 'Senior Engineer' });

      const result = await jobService.update('user-1', 'job-1', { title: 'Senior Engineer' });

      expect(result.title).toBe('Senior Engineer');
    });

    it('throws 404 when not found', async () => {
      mockPrismaJob.findFirst.mockResolvedValue(null);

      await expect(
        jobService.update('user-1', 'nonexistent', { title: 'New' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('merges notes into existing metadata', async () => {
      mockPrismaJob.findFirst.mockResolvedValue({
        ...mockJob,
        metadata: { existingField: 'value' },
      });
      mockPrismaJob.update.mockResolvedValue({
        ...mockJob,
        metadata: { existingField: 'value', notes: 'New notes' },
      });

      const result = await jobService.update('user-1', 'job-1', { notes: 'New notes' });

      expect(mockPrismaJob.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            metadata: { existingField: 'value', notes: 'New notes' },
          }),
        }),
      );
      expect(result.notes).toBe('New notes');
    });
  });

  describe('delete', () => {
    it('soft deletes the job', async () => {
      mockPrismaJob.findFirst.mockResolvedValue(mockJob);
      mockPrismaJob.update.mockResolvedValue({ ...mockJob, deletedAt: new Date() });

      await jobService.delete('user-1', 'job-1');

      expect(mockPrismaJob.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'job-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });

    it('throws 404 when not found', async () => {
      mockPrismaJob.findFirst.mockResolvedValue(null);

      await expect(jobService.delete('user-1', 'nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('updateStatus', () => {
    it('updates job status', async () => {
      mockPrismaJob.findFirst.mockResolvedValue(mockJob);
      mockPrismaJob.update.mockResolvedValue({ ...mockJob, status: 'READY_TO_APPLY' });

      const result = await jobService.updateStatus('user-1', 'job-1', 'READY_TO_APPLY');

      expect(result.status).toBe('READY_TO_APPLY');
    });

    it('throws 404 when not found', async () => {
      mockPrismaJob.findFirst.mockResolvedValue(null);

      await expect(
        jobService.updateStatus('user-1', 'nonexistent', 'READY_TO_APPLY'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('toggleFavorite', () => {
    it('sets favorite to true', async () => {
      mockPrismaJob.findFirst.mockResolvedValue(mockJob);
      mockPrismaJob.update.mockResolvedValue({ ...mockJob, isFavorite: true });

      const result = await jobService.toggleFavorite('user-1', 'job-1', true);

      expect(result.isFavorite).toBe(true);
    });

    it('sets favorite to false', async () => {
      mockPrismaJob.findFirst.mockResolvedValue({ ...mockJob, isFavorite: true });
      mockPrismaJob.update.mockResolvedValue({ ...mockJob, isFavorite: false });

      const result = await jobService.toggleFavorite('user-1', 'job-1', false);

      expect(result.isFavorite).toBe(false);
    });

    it('throws 404 when not found', async () => {
      mockPrismaJob.findFirst.mockResolvedValue(null);

      await expect(jobService.toggleFavorite('user-1', 'nonexistent', true)).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
