import { describe, expect, it, vi, beforeEach } from 'vitest';

import { integrationService } from '@/modules/integrations/integrations.service';

const mockPrismaJob = vi.hoisted(() => ({
  findMany: vi.fn(),
  findFirst: vi.fn(),
  update: vi.fn(),
}));

const mockPrismaApplication = vi.hoisted(() => ({
  findMany: vi.fn(),
}));

const mockPrismaIntegration = vi.hoisted(() => ({
  upsert: vi.fn(),
}));

vi.mock('@/config/prisma', () => ({
  prisma: {
    job: mockPrismaJob,
    application: mockPrismaApplication,
    integration: mockPrismaIntegration,
  },
}));

const mockJob = {
  id: 'job-1',
  userId: 'user-1',
  title: 'Software Engineer',
  company: 'Tech Corp',
  status: 'SAVED',
  matchScore: 85,
  createdAt: new Date('2026-01-15'),
  deletedAt: null,
};

const mockApp = {
  id: 'app-1',
  userId: 'user-1',
  status: 'SUBMITTED',
  createdAt: new Date('2026-02-01'),
  deletedAt: null,
  job: { title: 'Software Engineer', company: 'Tech Corp' },
};

describe('integrationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('syncGoogleSheets', () => {
    it('syncs all jobs and applications to sheets', async () => {
      mockPrismaJob.findMany.mockResolvedValue([mockJob]);
      mockPrismaApplication.findMany.mockResolvedValue([mockApp]);
      mockPrismaIntegration.upsert.mockResolvedValue({});

      const result = await integrationService.syncGoogleSheets('user-1');

      expect(result.success).toBe(true);
      expect(result.details).toEqual({ jobsSynced: 1, applicationsSynced: 1 });
      expect(mockPrismaIntegration.upsert).toHaveBeenCalledTimes(1);
    });

    it('handles empty data', async () => {
      mockPrismaJob.findMany.mockResolvedValue([]);
      mockPrismaApplication.findMany.mockResolvedValue([]);
      mockPrismaIntegration.upsert.mockResolvedValue({});

      const result = await integrationService.syncGoogleSheets('user-1');

      expect(result.success).toBe(true);
      expect(result.details).toEqual({ jobsSynced: 0, applicationsSynced: 0 });
    });
  });

  describe('syncGoogleSheetsJob', () => {
    it('syncs a single job to sheets', async () => {
      mockPrismaJob.findFirst.mockResolvedValue(mockJob);
      mockPrismaJob.update.mockResolvedValue({ ...mockJob, sheetRowId: 'row-job-1' });

      const result = await integrationService.syncGoogleSheetsJob('user-1', 'job-1');

      expect(result.success).toBe(true);
      expect(mockPrismaJob.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'job-1' },
          data: expect.objectContaining({ sheetRowId: expect.stringContaining('row-') }),
        }),
      );
    });

    it('throws 404 when job not found', async () => {
      mockPrismaJob.findFirst.mockResolvedValue(null);

      await expect(
        integrationService.syncGoogleSheetsJob('user-1', 'nonexistent'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('exportGoogleSheets', () => {
    it('returns exported data', async () => {
      mockPrismaJob.findMany.mockResolvedValue([mockJob]);
      mockPrismaApplication.findMany.mockResolvedValue([mockApp]);

      const result = await integrationService.exportGoogleSheets('user-1');

      expect(result.data.jobs).toHaveLength(1);
      expect(result.data.applications).toHaveLength(1);
      expect(result.exportedAt).toBeDefined();
    });
  });

  describe('syncTrello', () => {
    it('syncs all jobs to trello cards', async () => {
      mockPrismaJob.findMany.mockResolvedValue([mockJob]);
      mockPrismaIntegration.upsert.mockResolvedValue({});

      const result = await integrationService.syncTrello('user-1');

      expect(result.success).toBe(true);
      expect(result.details).toEqual({ cardsCreated: 1 });
    });
  });

  describe('createTrelloCard', () => {
    it('creates a trello card for a job', async () => {
      mockPrismaJob.findFirst.mockResolvedValue(mockJob);
      mockPrismaJob.update.mockResolvedValue({ ...mockJob, trelloCardId: 'mock-card-123' });

      const result = await integrationService.createTrelloCard('user-1', 'job-1');

      expect(result.cardId).toBeDefined();
      expect(result.url).toContain('trello.com');
      expect(mockPrismaJob.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'job-1' },
          data: expect.objectContaining({ trelloCardId: expect.any(String) }),
        }),
      );
    });

    it('throws 404 when job not found', async () => {
      mockPrismaJob.findFirst.mockResolvedValue(null);

      await expect(
        integrationService.createTrelloCard('user-1', 'nonexistent'),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('moveTrelloCard', () => {
    it('moves a trello card to a new list', async () => {
      const result = await integrationService.moveTrelloCard('user-1', 'card-1', 'Applied');

      expect(result.cardId).toBeDefined();
      expect(result.url).toContain('trello.com');
    });
  });

  describe('deleteTrelloCard', () => {
    it('deletes a trello card', async () => {
      const result = await integrationService.deleteTrelloCard('user-1', 'card-1');

      expect(result.success).toBe(true);
    });
  });
});
