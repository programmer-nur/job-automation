import { describe, expect, it, vi, beforeEach } from 'vitest';

import { coverLetterService } from '@/modules/cover-letters/cover-letters.service';

const mockPrismaCoverLetter = vi.hoisted(() => ({
  create: vi.fn(),
  findFirst: vi.fn(),
  findMany: vi.fn(),
  count: vi.fn(),
  update: vi.fn(),
}));

const mockJobFindById = vi.hoisted(() => vi.fn());

vi.mock('@/config/prisma', () => ({
  prisma: {
    coverLetter: mockPrismaCoverLetter,
  },
}));

vi.mock('@/modules/jobs/jobs.repository', () => ({
  jobRepository: {
    findById: mockJobFindById,
  },
}));

const mockCoverLetter = {
  id: 'cl-1',
  userId: 'user-1',
  jobId: null,
  content: 'Dear Hiring Manager...',
  tone: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  deletedAt: null,
};

const mockCoverLetterResponse = {
  id: mockCoverLetter.id,
  jobId: mockCoverLetter.jobId,
  content: mockCoverLetter.content,
  tone: mockCoverLetter.tone,
  createdAt: mockCoverLetter.createdAt,
  updatedAt: mockCoverLetter.updatedAt,
};

describe('coverLetterService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('creates cover letter', async () => {
      mockPrismaCoverLetter.create.mockResolvedValue(mockCoverLetter);

      const result = await coverLetterService.create('user-1', {
        content: 'Dear Hiring Manager...',
      });

      expect(result).toMatchObject(mockCoverLetterResponse);
      expect(mockPrismaCoverLetter.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user: { connect: { id: 'user-1' } },
          content: 'Dear Hiring Manager...',
        }),
      });
    });
  });

  describe('list', () => {
    it('returns paginated results', async () => {
      mockPrismaCoverLetter.findMany.mockResolvedValue([mockCoverLetter]);
      mockPrismaCoverLetter.count.mockResolvedValue(1);

      const result = await coverLetterService.list('user-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getById', () => {
    it('returns cover letter when found', async () => {
      mockPrismaCoverLetter.findFirst.mockResolvedValue(mockCoverLetter);

      const result = await coverLetterService.getById('user-1', 'cl-1');

      expect(result.id).toBe('cl-1');
    });

    it('throws 404 when not found', async () => {
      mockPrismaCoverLetter.findFirst.mockResolvedValue(null);

      await expect(coverLetterService.getById('user-1', 'nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('update', () => {
    it('updates and returns cover letter', async () => {
      mockPrismaCoverLetter.findFirst.mockResolvedValue(mockCoverLetter);
      mockPrismaCoverLetter.update.mockResolvedValue({ ...mockCoverLetter, tone: 'casual' });

      const result = await coverLetterService.update('user-1', 'cl-1', { tone: 'casual' });

      expect(result.tone).toBe('casual');
    });

    it('throws 404 when not found', async () => {
      mockPrismaCoverLetter.findFirst.mockResolvedValue(null);

      await expect(
        coverLetterService.update('user-1', 'nonexistent', { content: 'New' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('delete', () => {
    it('soft deletes', async () => {
      mockPrismaCoverLetter.findFirst.mockResolvedValue(mockCoverLetter);
      mockPrismaCoverLetter.update.mockResolvedValue({ ...mockCoverLetter, deletedAt: new Date() });

      await coverLetterService.delete('user-1', 'cl-1');

      expect(mockPrismaCoverLetter.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'cl-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });

    it('throws 404 when not found', async () => {
      mockPrismaCoverLetter.findFirst.mockResolvedValue(null);

      await expect(coverLetterService.delete('user-1', 'nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('generate', () => {
    it('throws 501 (not implemented)', async () => {
      mockJobFindById.mockResolvedValue({ id: 'job-1' });

      await expect(coverLetterService.generate('user-1', { jobId: 'job-1' })).rejects.toMatchObject(
        { statusCode: 501 },
      );
    });

    it('throws 404 when job not found', async () => {
      mockJobFindById.mockResolvedValue(null);

      await expect(
        coverLetterService.generate('user-1', { jobId: 'nonexistent' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
