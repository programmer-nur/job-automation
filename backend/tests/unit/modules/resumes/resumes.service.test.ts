import { describe, expect, it, vi, beforeEach } from 'vitest';

import { resumeService } from '@/modules/resumes/resumes.service';

const mockPrismaResume = vi.hoisted(() => ({
  create: vi.fn(),
  findFirst: vi.fn(),
  findMany: vi.fn(),
  count: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
  aggregate: vi.fn(),
}));

const mockJobFindById = vi.hoisted(() => vi.fn());

vi.mock('@/config/prisma', () => ({
  prisma: {
    resumeVersion: mockPrismaResume,
  },
}));

vi.mock('@/modules/jobs/jobs.repository', () => ({
  jobRepository: {
    findById: mockJobFindById,
  },
}));

const mockResume = {
  id: 'res-1',
  userId: 'user-1',
  version: 1,
  title: 'Frontend Resume',
  content: '## Experience',
  fileUrl: null,
  matchScore: null,
  isActive: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  deletedAt: null,
};

const mockResumeResponse = {
  id: mockResume.id,
  version: mockResume.version,
  title: mockResume.title,
  content: mockResume.content,
  fileUrl: mockResume.fileUrl,
  matchScore: mockResume.matchScore,
  isActive: mockResume.isActive,
  createdAt: mockResume.createdAt,
  updatedAt: mockResume.updatedAt,
};

describe('resumeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('creates resume with auto-incremented version', async () => {
      mockPrismaResume.aggregate.mockResolvedValue({ _max: { version: 3 } });
      mockPrismaResume.create.mockResolvedValue(mockResume);

      const result = await resumeService.create('user-1', {
        content: '## Experience',
      });

      expect(result).toMatchObject(mockResumeResponse);
      expect(mockPrismaResume.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ version: 4 }),
        }),
      );
    });

    it('starts version at 1 when no prior resumes', async () => {
      mockPrismaResume.aggregate.mockResolvedValue({ _max: { version: null } });
      mockPrismaResume.create.mockResolvedValue({ ...mockResume, version: 1 });

      await resumeService.create('user-1', { content: 'New resume' });

      expect(mockPrismaResume.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ version: 1 }),
        }),
      );
    });
  });

  describe('list', () => {
    it('returns paginated results', async () => {
      mockPrismaResume.findMany.mockResolvedValue([mockResume]);
      mockPrismaResume.count.mockResolvedValue(1);

      const result = await resumeService.list('user-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('filters by isActive', async () => {
      mockPrismaResume.findMany.mockResolvedValue([]);
      mockPrismaResume.count.mockResolvedValue(0);

      await resumeService.list('user-1', { page: 1, limit: 20, isActive: true });

      expect(mockPrismaResume.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isActive: true }),
        }),
      );
    });
  });

  describe('getById', () => {
    it('returns resume when found', async () => {
      mockPrismaResume.findFirst.mockResolvedValue(mockResume);

      const result = await resumeService.getById('user-1', 'res-1');

      expect(result.id).toBe('res-1');
    });

    it('throws 404 when not found', async () => {
      mockPrismaResume.findFirst.mockResolvedValue(null);

      await expect(resumeService.getById('user-1', 'nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('update', () => {
    it('updates and returns resume', async () => {
      mockPrismaResume.findFirst.mockResolvedValue(mockResume);
      mockPrismaResume.update.mockResolvedValue({ ...mockResume, title: 'Updated' });

      const result = await resumeService.update('user-1', 'res-1', { title: 'Updated' });

      expect(result.title).toBe('Updated');
    });

    it('throws 404 when not found', async () => {
      mockPrismaResume.findFirst.mockResolvedValue(null);

      await expect(
        resumeService.update('user-1', 'nonexistent', { title: 'New' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('delete', () => {
    it('soft deletes', async () => {
      mockPrismaResume.findFirst.mockResolvedValue(mockResume);
      mockPrismaResume.update.mockResolvedValue({ ...mockResume, deletedAt: new Date() });

      await resumeService.delete('user-1', 'res-1');

      expect(mockPrismaResume.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'res-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });

    it('throws 404 when not found', async () => {
      mockPrismaResume.findFirst.mockResolvedValue(null);

      await expect(resumeService.delete('user-1', 'nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('setActive', () => {
    it('deactivates all then activates target', async () => {
      mockPrismaResume.findFirst.mockResolvedValue(mockResume);
      mockPrismaResume.updateMany.mockResolvedValue({ count: 5 });
      mockPrismaResume.update.mockResolvedValue({ ...mockResume, isActive: true });

      const result = await resumeService.setActive('user-1', 'res-1');

      expect(result.isActive).toBe(true);
      expect(mockPrismaResume.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isActive: true, deletedAt: null },
        data: { isActive: false },
      });
    });

    it('throws 404 when not found', async () => {
      mockPrismaResume.findFirst.mockResolvedValue(null);

      await expect(resumeService.setActive('user-1', 'nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('tailor', () => {
    it('throws 501 (not implemented)', async () => {
      mockPrismaResume.findFirst.mockResolvedValue(mockResume);
      mockJobFindById.mockResolvedValue({ id: 'job-1' });

      await expect(resumeService.tailor('user-1', 'res-1', 'job-1')).rejects.toMatchObject({
        statusCode: 501,
      });
    });

    it('throws 404 when resume not found', async () => {
      mockPrismaResume.findFirst.mockResolvedValue(null);

      await expect(resumeService.tailor('user-1', 'nonexistent', 'job-1')).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it('throws 404 when job not found', async () => {
      mockPrismaResume.findFirst.mockResolvedValue(mockResume);
      mockJobFindById.mockResolvedValue(null);

      await expect(resumeService.tailor('user-1', 'res-1', 'nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
