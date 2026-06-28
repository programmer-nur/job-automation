import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mockListUsers = vi.fn();
const mockListJobs = vi.fn();
const mockGetAiStats = vi.fn();
const mockListAuditLogs = vi.fn();

vi.mock('@/modules/admin/admin.service', () => ({
  adminService: {
    listUsers: mockListUsers,
    listJobs: mockListJobs,
    getAiStats: mockGetAiStats,
    listAuditLogs: mockListAuditLogs,
  },
}));

const mockVerifyAccessToken = vi.hoisted(() => vi.fn());

vi.mock('@/utils/jwt', () => ({
  verifyAccessToken: mockVerifyAccessToken,
}));

let app: Express;

const mockMeta = { page: 1, limit: 20, total: 1, totalPages: 1 };

describe('Admin API', () => {
  beforeAll(async () => {
    mockVerifyAccessToken.mockReturnValue({ userId: 'admin-1', role: 'ADMIN' });
    const { createApp } = await import('@/app');
    app = createApp();
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/v1/admin/users', () => {
    it('returns 200 for admin', async () => {
      mockVerifyAccessToken.mockReturnValue({ userId: 'admin-1', role: 'ADMIN' });
      mockListUsers.mockResolvedValue({ data: [], meta: mockMeta });

      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
    });

    it('returns 403 for non-admin', async () => {
      mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });

      const res = await request(app)
        .get('/api/v1/admin/users')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(403);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get('/api/v1/admin/users');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/admin/jobs', () => {
    it('returns 200 for admin', async () => {
      mockVerifyAccessToken.mockReturnValue({ userId: 'admin-1', role: 'ADMIN' });
      mockListJobs.mockResolvedValue({ data: [], meta: mockMeta });

      const res = await request(app).get('/api/v1/admin/jobs').set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
    });

    it('returns 403 for non-admin', async () => {
      mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });

      const res = await request(app).get('/api/v1/admin/jobs').set('Authorization', 'Bearer token');

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/admin/ai', () => {
    it('returns 200 for admin', async () => {
      mockVerifyAccessToken.mockReturnValue({ userId: 'admin-1', role: 'ADMIN' });
      mockGetAiStats.mockResolvedValue({
        data: { totalRequests: 0, successRate: 0, byType: {}, recentRequests: [] },
        meta: mockMeta,
      });

      const res = await request(app).get('/api/v1/admin/ai').set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
    });

    it('returns 403 for non-admin', async () => {
      mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });

      const res = await request(app).get('/api/v1/admin/ai').set('Authorization', 'Bearer token');

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/v1/admin/audit-logs', () => {
    it('returns 200 for admin', async () => {
      mockVerifyAccessToken.mockReturnValue({ userId: 'admin-1', role: 'ADMIN' });
      mockListAuditLogs.mockResolvedValue({ data: [], meta: mockMeta });

      const res = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
    });

    it('returns 403 for non-admin', async () => {
      mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });

      const res = await request(app)
        .get('/api/v1/admin/audit-logs')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(403);
    });
  });
});
