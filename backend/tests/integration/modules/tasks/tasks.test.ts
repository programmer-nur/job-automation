import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/common/errors';

const mockCreate = vi.fn();
const mockList = vi.fn();
const mockGetById = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockComplete = vi.fn();
const mockIncomplete = vi.fn();

vi.mock('@/modules/tasks/tasks.service', () => ({
  taskService: {
    create: mockCreate,
    list: mockList,
    getById: mockGetById,
    update: mockUpdate,
    delete: mockDelete,
    complete: mockComplete,
    incomplete: mockIncomplete,
  },
}));

const mockVerifyAccessToken = vi.hoisted(() => vi.fn());

vi.mock('@/utils/jwt', () => ({
  verifyAccessToken: mockVerifyAccessToken,
}));

let app: Express;

const mockTaskResponse = {
  id: 'task-1',
  jobId: null,
  applicationId: null,
  title: 'Follow up',
  description: null,
  dueDate: null,
  completedAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Tasks API', () => {
  beforeAll(async () => {
    mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
    const { createApp } = await import('@/app');
    app = createApp();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
  });

  describe('POST /api/v1/tasks', () => {
    it('returns 201 on success', async () => {
      mockCreate.mockResolvedValue(mockTaskResponse);

      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Follow up' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('returns 422 for missing title', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(res.status).toBe(422);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app).post('/api/v1/tasks').send({ title: 'Follow up' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/tasks', () => {
    it('returns 200 with results', async () => {
      mockList.mockResolvedValue({
        data: [mockTaskResponse],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const res = await request(app).get('/api/v1/tasks').set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/v1/tasks/:id', () => {
    it('returns 200 when found', async () => {
      mockGetById.mockResolvedValue(mockTaskResponse);

      const res = await request(app)
        .get('/api/v1/tasks/task-1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
    });

    it('returns 404 when not found', async () => {
      mockGetById.mockRejectedValue(new AppError(404, 'Task not found', 'TASK_001'));

      const res = await request(app)
        .get('/api/v1/tasks/nonexistent')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/tasks/:id', () => {
    it('returns 200 on success', async () => {
      mockUpdate.mockResolvedValue({ ...mockTaskResponse, title: 'Updated' });

      const res = await request(app)
        .patch('/api/v1/tasks/task-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/v1/tasks/:id', () => {
    it('returns 204 on success', async () => {
      mockDelete.mockResolvedValue(undefined);

      const res = await request(app)
        .delete('/api/v1/tasks/task-1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(204);
    });
  });

  describe('PATCH /api/v1/tasks/:id/complete', () => {
    it('returns 200 on success', async () => {
      mockComplete.mockResolvedValue({
        ...mockTaskResponse,
        completedAt: new Date().toISOString(),
      });

      const res = await request(app)
        .patch('/api/v1/tasks/task-1/complete')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /api/v1/tasks/:id/incomplete', () => {
    it('returns 200 on success', async () => {
      mockIncomplete.mockResolvedValue(mockTaskResponse);

      const res = await request(app)
        .patch('/api/v1/tasks/task-1/incomplete')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
    });
  });
});
