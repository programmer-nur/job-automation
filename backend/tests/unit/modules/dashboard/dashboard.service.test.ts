import { describe, expect, it, vi, beforeEach } from 'vitest';

import { dashboardService } from '@/modules/dashboard/dashboard.service';

const mockPrismaJob = vi.hoisted(() => ({
  count: vi.fn(),
  findMany: vi.fn(),
}));
const mockPrismaApplication = vi.hoisted(() => ({
  count: vi.fn(),
}));
const mockPrismaTask = vi.hoisted(() => ({
  count: vi.fn(),
}));
const mockPrismaNotification = vi.hoisted(() => ({
  count: vi.fn(),
}));
const mockPrismaResumeVersion = vi.hoisted(() => ({
  count: vi.fn(),
}));

vi.mock('@/config/prisma', () => ({
  prisma: {
    job: mockPrismaJob,
    application: mockPrismaApplication,
    task: mockPrismaTask,
    notification: mockPrismaNotification,
    resumeVersion: mockPrismaResumeVersion,
  },
}));

describe('dashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSummary', () => {
    it('returns aggregate counts', async () => {
      mockPrismaJob.count.mockResolvedValue(42);
      mockPrismaApplication.count
        .mockResolvedValueOnce(18) // totalApplications
        .mockResolvedValueOnce(13) // activeApplications
        .mockResolvedValueOnce(3) // interviews
        .mockResolvedValueOnce(1) // offers
        .mockResolvedValueOnce(4); // rejections
      mockPrismaTask.count.mockResolvedValue(5);
      mockPrismaNotification.count.mockResolvedValue(2);
      mockPrismaResumeVersion.count.mockResolvedValue(1);

      const result = await dashboardService.getSummary('user-1');

      expect(result).toEqual({
        totalJobs: 42,
        totalApplications: 18,
        activeApplications: 13,
        interviews: 3,
        offers: 1,
        rejections: 4,
        pendingTasks: 5,
        unreadNotifications: 2,
        activeResumes: 1,
      });
    });
  });

  describe('getMonthly', () => {
    it('returns monthly aggregates grouped by month', async () => {
      const now = new Date('2026-06-01');
      vi.useFakeTimers({ now });

      mockPrismaApplication.findMany = vi.fn().mockResolvedValue([
        { createdAt: new Date('2026-01-15'), status: 'APPLIED' },
        { createdAt: new Date('2026-01-20'), status: 'INTERVIEWING' },
        { createdAt: new Date('2026-02-10'), status: 'APPLIED' },
        { createdAt: new Date('2026-02-15'), status: 'INTERVIEWING' },
        { createdAt: new Date('2026-02-20'), status: 'OFFER' },
        { createdAt: new Date('2026-03-05'), status: 'REJECTED' },
      ]);

      const result = await dashboardService.getMonthly('user-1');

      expect(result).toEqual({
        monthly: [
          { month: '2026-01', applications: 2, interviews: 1, offers: 0 },
          { month: '2026-02', applications: 3, interviews: 1, offers: 1 },
          { month: '2026-03', applications: 1, interviews: 0, offers: 0 },
        ],
      });

      vi.useRealTimers();
    });

    it('returns empty array when no applications', async () => {
      mockPrismaApplication.findMany = vi.fn().mockResolvedValue([]);

      const result = await dashboardService.getMonthly('user-1');

      expect(result).toEqual({ monthly: [] });
    });
  });

  describe('getMatchScores', () => {
    it('returns score distribution buckets', async () => {
      const mockJobs = [
        { matchScore: 15 },
        { matchScore: 25 },
        { matchScore: 45 },
        { matchScore: 55 },
        { matchScore: 65 },
        { matchScore: 75 },
        { matchScore: 85 },
        { matchScore: 95 },
        { matchScore: 72 },
      ];
      mockPrismaJob.findMany.mockResolvedValue(mockJobs);

      const result = await dashboardService.getMatchScores('user-1');

      expect(result).toEqual({
        scores: [
          { range: '0-20', count: 1 },
          { range: '21-40', count: 1 },
          { range: '41-60', count: 2 },
          { range: '61-80', count: 3 },
          { range: '81-100', count: 2 },
        ],
      });
    });

    it('returns empty buckets when no jobs with scores', async () => {
      mockPrismaJob.findMany.mockResolvedValue([]);

      const result = await dashboardService.getMatchScores('user-1');

      expect(result).toEqual({
        scores: [
          { range: '0-20', count: 0 },
          { range: '21-40', count: 0 },
          { range: '41-60', count: 0 },
          { range: '61-80', count: 0 },
          { range: '81-100', count: 0 },
        ],
      });
    });
  });

  describe('getSources', () => {
    it('returns source distribution', async () => {
      const mockJobs = [
        { source: 'LinkedIn' },
        { source: 'LinkedIn' },
        { source: 'Indeed' },
        { source: 'Company Website' },
        { source: 'LinkedIn' },
        { source: 'Indeed' },
      ];
      mockPrismaJob.findMany.mockResolvedValue(mockJobs);

      const result = await dashboardService.getSources('user-1');

      expect(result).toEqual({
        sources: [
          { source: 'LinkedIn', count: 3 },
          { source: 'Indeed', count: 2 },
          { source: 'Company Website', count: 1 },
        ],
      });
    });

    it('returns empty array when no sources', async () => {
      mockPrismaJob.findMany.mockResolvedValue([]);

      const result = await dashboardService.getSources('user-1');

      expect(result).toEqual({ sources: [] });
    });
  });
});
