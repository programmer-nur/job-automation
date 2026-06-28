import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetSummary = vi.fn();
const mockGetMonthly = vi.fn();
const mockGetMatchScores = vi.fn();
const mockGetSources = vi.fn();

vi.mock('@/modules/dashboard/dashboard.service', () => ({
  dashboardService: {
    getSummary: mockGetSummary,
    getMonthly: mockGetMonthly,
    getMatchScores: mockGetMatchScores,
    getSources: mockGetSources,
  },
}));

const mockVerifyAccessToken = vi.hoisted(() => vi.fn());

vi.mock('@/utils/jwt', () => ({
  verifyAccessToken: mockVerifyAccessToken,
}));

let app: Express;

describe('Dashboard API', () => {
  beforeAll(async () => {
    mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
    const { createApp } = await import('@/app');
    app = createApp();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
  });

  describe('GET /api/v1/dashboard/summary', () => {
    it('returns 200 with summary', async () => {
      mockGetSummary.mockResolvedValue({
        totalJobs: 42,
        totalApplications: 18,
        activeApplications: 12,
        interviews: 3,
        offers: 1,
        rejections: 4,
        pendingTasks: 5,
        unreadNotifications: 2,
        activeResumes: 1,
      });

      const res = await request(app)
        .get('/api/v1/dashboard/summary')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalJobs).toBe(42);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get('/api/v1/dashboard/summary');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/dashboard/monthly', () => {
    it('returns 200 with monthly data', async () => {
      mockGetMonthly.mockResolvedValue({
        monthly: [{ month: '2026-01', applications: 2, interviews: 1, offers: 0 }],
      });

      const res = await request(app)
        .get('/api/v1/dashboard/monthly')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.data.monthly).toHaveLength(1);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get('/api/v1/dashboard/monthly');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/dashboard/match-scores', () => {
    it('returns 200 with score distribution', async () => {
      mockGetMatchScores.mockResolvedValue({
        scores: [
          { range: '0-20', count: 1 },
          { range: '21-40', count: 2 },
          { range: '41-60', count: 5 },
          { range: '61-80', count: 8 },
          { range: '81-100', count: 4 },
        ],
      });

      const res = await request(app)
        .get('/api/v1/dashboard/match-scores')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.data.scores).toHaveLength(5);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get('/api/v1/dashboard/match-scores');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/dashboard/sources', () => {
    it('returns 200 with source distribution', async () => {
      mockGetSources.mockResolvedValue({
        sources: [
          { source: 'LinkedIn', count: 10 },
          { source: 'Indeed', count: 5 },
        ],
      });

      const res = await request(app)
        .get('/api/v1/dashboard/sources')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.data.sources).toHaveLength(2);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get('/api/v1/dashboard/sources');

      expect(res.status).toBe(401);
    });
  });
});
