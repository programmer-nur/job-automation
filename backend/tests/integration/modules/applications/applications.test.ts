import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/common/errors';

const mockCreate = vi.fn();
const mockList = vi.fn();
const mockGetById = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockUpdateStatus = vi.fn();
const mockScheduleFollowUp = vi.fn();
const mockUpdateNotes = vi.fn();

vi.mock('@/modules/applications/applications.service', () => ({
  applicationService: {
    create: mockCreate,
    list: mockList,
    getById: mockGetById,
    update: mockUpdate,
    delete: mockDelete,
    updateStatus: mockUpdateStatus,
    scheduleFollowUp: mockScheduleFollowUp,
    updateNotes: mockUpdateNotes,
  },
}));

const mockVerifyAccessToken = vi.hoisted(() => vi.fn());

vi.mock('@/utils/jwt', () => ({
  verifyAccessToken: mockVerifyAccessToken,
}));

let app: Express;

const mockAppResponse = {
  id: 'app-1',
  jobId: 'job-1',
  status: 'DRAFT',
  notes: null,
  followUpDate: null,
  submittedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Applications API', () => {
  beforeAll(async () => {
    mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
    const { createApp } = await import('@/app');
    app = createApp();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
  });

  describe('POST /api/v1/applications', () => {
    it('returns 201 on success', async () => {
      mockCreate.mockResolvedValue(mockAppResponse);

      const res = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', 'Bearer token')
        .send({ jobId: '550e8400-e29b-41d4-a716-446655440000' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('returns 422 for invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/applications')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(res.status).toBe(422);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .post('/api/v1/applications')
        .send({ jobId: '550e8400-e29b-41d4-a716-446655440000' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/applications', () => {
    it('returns 200 with paginated results', async () => {
      mockList.mockResolvedValue({
        data: [mockAppResponse],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const res = await request(app)
        .get('/api/v1/applications')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/v1/applications/:id', () => {
    it('returns 200 when found', async () => {
      mockGetById.mockResolvedValue(mockAppResponse);

      const res = await request(app)
        .get('/api/v1/applications/app-1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
    });

    it('returns 404 when not found', async () => {
      mockGetById.mockRejectedValue(new AppError(404, 'Application not found', 'APP_001'));

      const res = await request(app)
        .get('/api/v1/applications/nonexistent')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/applications/:id', () => {
    it('returns 200 on success', async () => {
      mockUpdate.mockResolvedValue({ ...mockAppResponse, notes: 'Updated' });

      const res = await request(app)
        .patch('/api/v1/applications/app-1')
        .set('Authorization', 'Bearer token')
        .send({ notes: 'Updated' });

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/v1/applications/:id', () => {
    it('returns 204 on success', async () => {
      mockDelete.mockResolvedValue(undefined);

      const res = await request(app)
        .delete('/api/v1/applications/app-1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(204);
    });
  });

  describe('PATCH /api/v1/applications/:id/status', () => {
    it('returns 200 on success', async () => {
      mockUpdateStatus.mockResolvedValue({ ...mockAppResponse, status: 'SUBMITTED' });

      const res = await request(app)
        .patch('/api/v1/applications/app-1/status')
        .set('Authorization', 'Bearer token')
        .send({ status: 'SUBMITTED' });

      expect(res.status).toBe(200);
    });

    it('returns 422 for invalid status', async () => {
      const res = await request(app)
        .patch('/api/v1/applications/app-1/status')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID' });

      expect(res.status).toBe(422);
    });
  });

  describe('PATCH /api/v1/applications/:id/follow-up', () => {
    it('returns 200 on success', async () => {
      mockScheduleFollowUp.mockResolvedValue({
        ...mockAppResponse,
        followUpDate: '2026-07-15T10:00:00.000Z',
      });

      const res = await request(app)
        .patch('/api/v1/applications/app-1/follow-up')
        .set('Authorization', 'Bearer token')
        .send({ followUpDate: '2026-07-15T10:00:00.000Z' });

      expect(res.status).toBe(200);
    });

    it('returns 422 for invalid date', async () => {
      const res = await request(app)
        .patch('/api/v1/applications/app-1/follow-up')
        .set('Authorization', 'Bearer token')
        .send({ followUpDate: 'bad-date' });

      expect(res.status).toBe(422);
    });
  });

  describe('PATCH /api/v1/applications/:id/notes', () => {
    it('returns 200 on success', async () => {
      mockUpdateNotes.mockResolvedValue({ ...mockAppResponse, notes: 'New notes' });

      const res = await request(app)
        .patch('/api/v1/applications/app-1/notes')
        .set('Authorization', 'Bearer token')
        .send({ notes: 'New notes' });

      expect(res.status).toBe(200);
    });
  });
});
