import { describe, expect, it, vi, beforeEach } from 'vitest';

import { adminService } from '@/modules/admin/admin.service';

const mockPrismaUser = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
}));

const mockPrismaJob = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
}));

const mockPrismaAIRequest = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
}));

const mockPrismaAuditLog = vi.hoisted(() => ({
  findMany: vi.fn(),
  count: vi.fn(),
}));

vi.mock('@/config/prisma', () => ({
  prisma: {
    user: mockPrismaUser,
    job: mockPrismaJob,
    aIRequest: mockPrismaAIRequest,
    auditLog: mockPrismaAuditLog,
  },
}));

const mockUser = {
  id: 'user-1',
  email: 'user@test.com',
  name: 'Test User',
  role: 'USER',
  isActive: true,
  passwordHash: 'hashed',
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-01'),
  deletedAt: null,
  _count: { jobs: 5 },
};

const mockJob = {
  id: 'job-1',
  userId: 'user-1',
  title: 'Engineer',
  company: 'Tech',
  status: 'SAVED',
  createdAt: new Date('2026-01-15'),
  user: { email: 'user@test.com' },
};

const mockAiRequest = {
  id: 'ai-1',
  userId: 'user-1',
  type: 'parse-job',
  status: 'completed',
  durationMs: 500,
  model: 'mock',
  createdAt: new Date('2026-01-15'),
  user: { email: 'user@test.com' },
};

const mockAuditLog = {
  id: 'log-1',
  userId: 'user-1',
  action: 'USER_LOGIN',
  entity: 'User',
  entityId: 'user-1',
  createdAt: new Date('2026-01-01'),
  user: { email: 'user@test.com' },
};

describe('adminService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listUsers', () => {
    it('returns paginated users without passwordHash', async () => {
      mockPrismaUser.findMany.mockResolvedValue([mockUser]);
      mockPrismaUser.count.mockResolvedValue(1);

      const result = await adminService.listUsers(1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).not.toHaveProperty('passwordHash');
      expect(result.data[0]).toHaveProperty('jobCount', 5);
      expect(result.meta.total).toBe(1);
    });

    it('returns empty array when no users', async () => {
      mockPrismaUser.findMany.mockResolvedValue([]);
      mockPrismaUser.count.mockResolvedValue(0);

      const result = await adminService.listUsers(1, 20);

      expect(result.data).toHaveLength(0);
    });
  });

  describe('listJobs', () => {
    it('returns paginated jobs with userEmail', async () => {
      mockPrismaJob.findMany.mockResolvedValue([mockJob]);
      mockPrismaJob.count.mockResolvedValue(1);

      const result = await adminService.listJobs(1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toHaveProperty('userEmail', 'user@test.com');
    });
  });

  describe('getAiStats', () => {
    it('returns AI usage statistics', async () => {
      mockPrismaAIRequest.count.mockResolvedValue(100);
      mockPrismaAIRequest.findMany
        .mockResolvedValueOnce([
          { type: 'parse-job' },
          { type: 'parse-job' },
          { type: 'score-job' },
        ])
        .mockResolvedValueOnce([mockAiRequest]);

      const result = await adminService.getAiStats(1, 20);

      expect(result.data.totalRequests).toBe(100);
      expect(result.data.successRate).toBeGreaterThan(0);
      expect(result.data.byType['parse-job']).toBe(2);
      expect(result.data.recentRequests).toHaveLength(1);
    });

    it('handles zero requests', async () => {
      mockPrismaAIRequest.count.mockResolvedValue(0);
      mockPrismaAIRequest.findMany.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

      const result = await adminService.getAiStats(1, 20);

      expect(result.data.totalRequests).toBe(0);
      expect(result.data.successRate).toBe(0);
    });
  });

  describe('listAuditLogs', () => {
    it('returns paginated audit logs', async () => {
      mockPrismaAuditLog.findMany.mockResolvedValue([mockAuditLog]);
      mockPrismaAuditLog.count.mockResolvedValue(1);

      const result = await adminService.listAuditLogs(1, 20);

      expect(result.data).toHaveLength(1);
    });
  });
});
