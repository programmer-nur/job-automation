import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/common/errors';

const mockCreate = vi.fn();
const mockList = vi.fn();
const mockGetById = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockGenerate = vi.fn();

vi.mock('@/modules/cover-letters/cover-letters.service', () => ({
  coverLetterService: {
    create: mockCreate,
    list: mockList,
    getById: mockGetById,
    update: mockUpdate,
    delete: mockDelete,
    generate: mockGenerate,
  },
}));

const mockVerifyAccessToken = vi.hoisted(() => vi.fn());

vi.mock('@/utils/jwt', () => ({
  verifyAccessToken: mockVerifyAccessToken,
}));

let app: Express;

const mockCoverLetterResponse = {
  id: 'cl-1',
  jobId: null,
  content: 'Dear Hiring Manager...',
  tone: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Cover Letters API', () => {
  beforeAll(async () => {
    mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
    const { createApp } = await import('@/app');
    app = createApp();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
  });

  describe('POST /api/v1/cover-letters', () => {
    it('returns 201 on success', async () => {
      mockCreate.mockResolvedValue(mockCoverLetterResponse);

      const res = await request(app)
        .post('/api/v1/cover-letters')
        .set('Authorization', 'Bearer token')
        .send({ content: 'Dear Hiring Manager...' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('returns 422 for missing content', async () => {
      const res = await request(app)
        .post('/api/v1/cover-letters')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(res.status).toBe(422);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .post('/api/v1/cover-letters')
        .send({ content: 'Dear Hiring Manager...' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/cover-letters', () => {
    it('returns 200 with results', async () => {
      mockList.mockResolvedValue({
        data: [mockCoverLetterResponse],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const res = await request(app)
        .get('/api/v1/cover-letters')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/v1/cover-letters/:id', () => {
    it('returns 200 when found', async () => {
      mockGetById.mockResolvedValue(mockCoverLetterResponse);

      const res = await request(app)
        .get('/api/v1/cover-letters/cl-1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
    });

    it('returns 404 when not found', async () => {
      mockGetById.mockRejectedValue(new AppError(404, 'Cover letter not found', 'COVER_001'));

      const res = await request(app)
        .get('/api/v1/cover-letters/nonexistent')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/cover-letters/:id', () => {
    it('returns 200 on success', async () => {
      mockUpdate.mockResolvedValue({ ...mockCoverLetterResponse, tone: 'casual' });

      const res = await request(app)
        .patch('/api/v1/cover-letters/cl-1')
        .set('Authorization', 'Bearer token')
        .send({ tone: 'casual' });

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/v1/cover-letters/:id', () => {
    it('returns 204 on success', async () => {
      mockDelete.mockResolvedValue(undefined);

      const res = await request(app)
        .delete('/api/v1/cover-letters/cl-1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(204);
    });
  });

  describe('POST /api/v1/cover-letters/generate', () => {
    it('returns 501 (not implemented)', async () => {
      mockGenerate.mockRejectedValue(
        new AppError(501, 'AI cover letter generation is not yet implemented', 'AI_003'),
      );

      const res = await request(app)
        .post('/api/v1/cover-letters/generate')
        .set('Authorization', 'Bearer token')
        .send({ jobId: '550e8400-e29b-41d4-a716-446655440000' });

      expect(res.status).toBe(501);
    });

    it('returns 422 for missing jobId', async () => {
      const res = await request(app)
        .post('/api/v1/cover-letters/generate')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(res.status).toBe(422);
    });
  });
});
