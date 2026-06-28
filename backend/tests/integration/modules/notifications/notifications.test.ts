import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@/common/errors';

const mockCreate = vi.fn();
const mockList = vi.fn();
const mockGetById = vi.fn();
const mockMarkAsRead = vi.fn();
const mockMarkAllAsRead = vi.fn();

vi.mock('@/modules/notifications/notifications.service', () => ({
  notificationService: {
    create: mockCreate,
    list: mockList,
    getById: mockGetById,
    markAsRead: mockMarkAsRead,
    markAllAsRead: mockMarkAllAsRead,
  },
}));

const mockVerifyAccessToken = vi.hoisted(() => vi.fn());

vi.mock('@/utils/jwt', () => ({
  verifyAccessToken: mockVerifyAccessToken,
}));

let app: Express;

const mockNotificationResponse = {
  id: 'notif-1',
  title: 'Interview Reminder',
  message: 'Interview tomorrow at 2pm',
  type: 'reminder',
  isRead: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('Notifications API', () => {
  beforeAll(async () => {
    mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
    const { createApp } = await import('@/app');
    app = createApp();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
  });

  describe('POST /api/v1/notifications', () => {
    it('returns 201 on success', async () => {
      mockCreate.mockResolvedValue(mockNotificationResponse);

      const res = await request(app)
        .post('/api/v1/notifications')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Reminder', message: 'Body', type: 'reminder' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('returns 422 for missing title', async () => {
      const res = await request(app)
        .post('/api/v1/notifications')
        .set('Authorization', 'Bearer token')
        .send({ message: 'Body', type: 'reminder' });

      expect(res.status).toBe(422);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .post('/api/v1/notifications')
        .send({ title: 'Title', message: 'Body', type: 'reminder' });

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/v1/notifications', () => {
    it('returns 200 with results', async () => {
      mockList.mockResolvedValue({
        data: [mockNotificationResponse],
        meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
      });

      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });
  });

  describe('GET /api/v1/notifications/:id', () => {
    it('returns 200 when found', async () => {
      mockGetById.mockResolvedValue(mockNotificationResponse);

      const res = await request(app)
        .get('/api/v1/notifications/notif-1')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
    });

    it('returns 404 when not found', async () => {
      mockGetById.mockRejectedValue(new AppError(404, 'Notification not found', 'NOTIF_001'));

      const res = await request(app)
        .get('/api/v1/notifications/nonexistent')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/v1/notifications/:id/read', () => {
    it('returns 200 on success', async () => {
      mockMarkAsRead.mockResolvedValue({ ...mockNotificationResponse, isRead: true });

      const res = await request(app)
        .patch('/api/v1/notifications/notif-1/read')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
    });
  });

  describe('PATCH /api/v1/notifications/read-all', () => {
    it('returns 200 on success', async () => {
      mockMarkAllAsRead.mockResolvedValue(undefined);

      const res = await request(app)
        .patch('/api/v1/notifications/read-all')
        .set('Authorization', 'Bearer token');

      expect(res.status).toBe(200);
    });
  });
});
