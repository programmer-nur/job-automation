import { describe, expect, it, vi, beforeEach } from 'vitest';

import { applicationService } from '@/modules/applications/applications.service';

const mockPrismaApplication = vi.hoisted(() => ({
  create: vi.fn(),
  findFirst: vi.fn(),
  findMany: vi.fn(),
  count: vi.fn(),
  update: vi.fn(),
}));

const mockJobFindById = vi.hoisted(() => vi.fn());

vi.mock('@/config/prisma', () => ({
  prisma: {
    application: mockPrismaApplication,
  },
}));

vi.mock('@/modules/jobs/jobs.repository', () => ({
  jobRepository: {
    findById: mockJobFindById,
  },
}));

const mockJob = { id: 'job-1', userId: 'user-1', title: 'Engineer', company: 'Google' };
const mockApp = {
  id: 'app-1',
  userId: 'user-1',
  jobId: 'job-1',
  status: 'DRAFT',
  resumeId: null,
  coverLetterId: null,
  notes: null,
  followUpDate: null,
  submittedAt: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  deletedAt: null,
};

describe('applicationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('creates an application for existing job', async () => {
      mockJobFindById.mockResolvedValue(mockJob);
      mockPrismaApplication.create.mockResolvedValue(mockApp);

      const result = await applicationService.create('user-1', { jobId: 'job-1' });

      expect(result).toMatchObject({ jobId: 'job-1', status: 'DRAFT' });
      expect(mockPrismaApplication.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user: { connect: { id: 'user-1' } },
          job: { connect: { id: 'job-1' } },
        }),
      });
    });

    it('throws 404 when job not found', async () => {
      mockJobFindById.mockResolvedValue(null);

      await expect(
        applicationService.create('user-1', { jobId: 'nonexistent' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('list', () => {
    it('returns paginated results', async () => {
      mockPrismaApplication.findMany.mockResolvedValue([mockApp]);
      mockPrismaApplication.count.mockResolvedValue(1);

      const result = await applicationService.list('user-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({ page: 1, limit: 20, total: 1, totalPages: 1 });
    });

    it('filters by status', async () => {
      mockPrismaApplication.findMany.mockResolvedValue([]);
      mockPrismaApplication.count.mockResolvedValue(0);

      await applicationService.list('user-1', { page: 1, limit: 20, status: 'SUBMITTED' });

      expect(mockPrismaApplication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'SUBMITTED' }),
        }),
      );
    });

    it('filters by jobId', async () => {
      mockPrismaApplication.findMany.mockResolvedValue([]);
      mockPrismaApplication.count.mockResolvedValue(0);

      await applicationService.list('user-1', { page: 1, limit: 20, jobId: 'job-1' });

      expect(mockPrismaApplication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ jobId: 'job-1' }),
        }),
      );
    });
  });

  describe('getById', () => {
    it('returns application when found', async () => {
      mockPrismaApplication.findFirst.mockResolvedValue(mockApp);

      const result = await applicationService.getById('user-1', 'app-1');

      expect(result.id).toBe('app-1');
    });

    it('throws 404 when not found', async () => {
      mockPrismaApplication.findFirst.mockResolvedValue(null);

      await expect(applicationService.getById('user-1', 'nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('update', () => {
    it('updates and returns application', async () => {
      mockPrismaApplication.findFirst.mockResolvedValue(mockApp);
      mockPrismaApplication.update.mockResolvedValue({ ...mockApp, notes: 'Updated' });

      const result = await applicationService.update('user-1', 'app-1', { notes: 'Updated' });

      expect(result.notes).toBe('Updated');
    });

    it('throws 404 when not found', async () => {
      mockPrismaApplication.findFirst.mockResolvedValue(null);

      await expect(
        applicationService.update('user-1', 'nonexistent', { notes: 'New' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('delete', () => {
    it('soft deletes', async () => {
      mockPrismaApplication.findFirst.mockResolvedValue(mockApp);
      mockPrismaApplication.update.mockResolvedValue({ ...mockApp, deletedAt: new Date() });

      await applicationService.delete('user-1', 'app-1');

      expect(mockPrismaApplication.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'app-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });

    it('throws 404 when not found', async () => {
      mockPrismaApplication.findFirst.mockResolvedValue(null);

      await expect(applicationService.delete('user-1', 'nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('updateStatus', () => {
    it('updates status', async () => {
      mockPrismaApplication.findFirst.mockResolvedValue(mockApp);
      mockPrismaApplication.update.mockResolvedValue({ ...mockApp, status: 'SUBMITTED' });

      const result = await applicationService.updateStatus('user-1', 'app-1', 'SUBMITTED');

      expect(result.status).toBe('SUBMITTED');
    });

    it('throws 404 when not found', async () => {
      mockPrismaApplication.findFirst.mockResolvedValue(null);

      await expect(
        applicationService.updateStatus('user-1', 'nonexistent', 'SUBMITTED'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('scheduleFollowUp', () => {
    it('sets follow-up date', async () => {
      const date = new Date('2026-07-15T10:00:00Z');
      mockPrismaApplication.findFirst.mockResolvedValue(mockApp);
      mockPrismaApplication.update.mockResolvedValue({ ...mockApp, followUpDate: date });

      const result = await applicationService.scheduleFollowUp('user-1', 'app-1', date);

      expect(result.followUpDate).toEqual(date);
    });

    it('throws 404 when not found', async () => {
      mockPrismaApplication.findFirst.mockResolvedValue(null);

      await expect(
        applicationService.scheduleFollowUp('user-1', 'nonexistent', new Date()),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('updateNotes', () => {
    it('updates notes', async () => {
      mockPrismaApplication.findFirst.mockResolvedValue(mockApp);
      mockPrismaApplication.update.mockResolvedValue({ ...mockApp, notes: 'New notes' });

      const result = await applicationService.updateNotes('user-1', 'app-1', 'New notes');

      expect(result.notes).toBe('New notes');
    });

    it('clears notes when null', async () => {
      mockPrismaApplication.findFirst.mockResolvedValue(mockApp);
      mockPrismaApplication.update.mockResolvedValue({ ...mockApp, notes: null });

      const result = await applicationService.updateNotes('user-1', 'app-1', null);

      expect(result.notes).toBeNull();
    });

    it('throws 404 when not found', async () => {
      mockPrismaApplication.findFirst.mockResolvedValue(null);

      await expect(
        applicationService.updateNotes('user-1', 'nonexistent', 'Notes'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
