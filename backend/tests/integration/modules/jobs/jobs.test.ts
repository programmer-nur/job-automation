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
const mockToggleFavorite = vi.fn();

vi.mock('@/modules/jobs/jobs.service', () => ({
  jobService: {
    create: mockCreate,
    list: mockList,
    getById: mockGetById,
    update: mockUpdate,
    delete: mockDelete,
    updateStatus: mockUpdateStatus,
    toggleFavorite: mockToggleFavorite,
  },
}));

const mockVerifyAccessToken = vi.hoisted(() => vi.fn());

vi.mock('@/utils/jwt', () => ({
  verifyAccessToken: mockVerifyAccessToken,
}));

let app: Express;

const mockJobResponse = {
  id: 'job-1',
  title: 'Software Engineer',
  company: 'Google',
  location: null,
  description: null,
  url: null,
  salaryRange: null,
  jobType: null,
  source: null,
  status: 'SAVED',
  matchScore: null,
  isFavorite: false,
  notes: null,
  appliedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Jobs API', () => {
  beforeAll(async () => {
    mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
    const { createApp } = await import('@/app');
    app = createApp();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
  });

  describe('POST /api/v1/jobs', () => {
    it('returns 201 on success', async () => {
      mockCreate.mockResolvedValue(mockJobResponse);

      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Engineer', company: 'Google' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Software Engineer');
    });

    it('returns 422 for invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/jobs')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(res.status).toBe(422);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .post('/api/v1/jobs')
        .send({ title: 'Engineer', company: 'Google' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/jobs', () => {
    it('returns 200 with paginated results', async () => {
      mockList.mockResolvedValue({
        data: [mockJobResponse],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const res = await request(app).get('/api/v1/jobs').set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).get('/api/v1/jobs');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/jobs/:id', () => {
    it('returns 200 when found', async () => {
      mockGetById.mockResolvedValue(mockJobResponse);

      const res = await request(app).get('/api/v1/jobs/job-1').set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('job-1');
    });

    it('returns 404 when not found', async () => {
      mockGetById.mockRejectedValue(new AppError(404, 'Job not found', 'JOB_001'));

      const res = await request(app)
        .get('/api/v1/jobs/nonexistent')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/jobs/:id', () => {
    it('returns 200 on success', async () => {
      mockUpdate.mockResolvedValue({ ...mockJobResponse, title: 'Updated' });

      const res = await request(app)
        .patch('/api/v1/jobs/job-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Updated');
    });

    it('returns 404 when not found', async () => {
      mockUpdate.mockRejectedValue(new AppError(404, 'Job not found', 'JOB_001'));

      const res = await request(app)
        .patch('/api/v1/jobs/nonexistent')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/jobs/:id', () => {
    it('returns 204 on success', async () => {
      mockDelete.mockResolvedValue(undefined);

      const res = await request(app)
        .delete('/api/v1/jobs/job-1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(204);
    });

    it('returns 404 when not found', async () => {
      mockDelete.mockRejectedValue(new AppError(404, 'Job not found', 'JOB_001'));

      const res = await request(app)
        .delete('/api/v1/jobs/nonexistent')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/jobs/:id/status', () => {
    it('returns 200 on success', async () => {
      mockUpdateStatus.mockResolvedValue({ ...mockJobResponse, status: 'READY_TO_APPLY' });

      const res = await request(app)
        .patch('/api/v1/jobs/job-1/status')
        .set('Authorization', 'Bearer token')
        .send({ status: 'READY_TO_APPLY' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('READY_TO_APPLY');
    });

    it('returns 422 for invalid status', async () => {
      const res = await request(app)
        .patch('/api/v1/jobs/job-1/status')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID' });

      expect(res.status).toBe(422);
    });
  });

  describe('PATCH /api/v1/jobs/:id/favorite', () => {
    it('returns 200 on success', async () => {
      mockToggleFavorite.mockResolvedValue({ ...mockJobResponse, isFavorite: true });

      const res = await request(app)
        .patch('/api/v1/jobs/job-1/favorite')
        .set('Authorization', 'Bearer token')
        .send({ isFavorite: true });

      expect(res.status).toBe(200);
      expect(res.body.data.isFavorite).toBe(true);
    });

    it('returns 422 for invalid body', async () => {
      const res = await request(app)
        .patch('/api/v1/jobs/job-1/favorite')
        .set('Authorization', 'Bearer token')
        .send({ isFavorite: 'yes' });

      expect(res.status).toBe(422);
    });
  });
});
