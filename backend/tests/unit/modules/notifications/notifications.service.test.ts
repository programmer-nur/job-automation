import { describe, expect, it, vi, beforeEach } from 'vitest';

import { notificationService } from '@/modules/notifications/notifications.service';

const mockPrismaNotification = vi.hoisted(() => ({
  create: vi.fn(),
  findFirst: vi.fn(),
  findMany: vi.fn(),
  count: vi.fn(),
  update: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock('@/config/prisma', () => ({
  prisma: {
    notification: mockPrismaNotification,
  },
}));

const mockNotification = {
  id: 'notif-1',
  userId: 'user-1',
  title: 'Interview Reminder',
  message: 'Interview tomorrow at 2pm',
  type: 'reminder',
  isRead: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
};

const mockNotificationResponse = {
  id: mockNotification.id,
  title: mockNotification.title,
  message: mockNotification.message,
  type: mockNotification.type,
  isRead: mockNotification.isRead,
  createdAt: mockNotification.createdAt,
  updatedAt: mockNotification.updatedAt,
};

describe('notificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('creates a notification', async () => {
      mockPrismaNotification.create.mockResolvedValue(mockNotification);

      const result = await notificationService.create('user-1', {
        title: 'Interview Reminder',
        message: 'Interview tomorrow',
        type: 'reminder',
      });

      expect(result).toMatchObject(mockNotificationResponse);
      expect(mockPrismaNotification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user: { connect: { id: 'user-1' } },
          title: 'Interview Reminder',
        }),
      });
    });
  });

  describe('list', () => {
    it('returns paginated results', async () => {
      mockPrismaNotification.findMany.mockResolvedValue([mockNotification]);
      mockPrismaNotification.count.mockResolvedValue(1);

      const result = await notificationService.list('user-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('filters by isRead', async () => {
      mockPrismaNotification.findMany.mockResolvedValue([]);
      mockPrismaNotification.count.mockResolvedValue(0);

      await notificationService.list('user-1', { page: 1, limit: 20, isRead: true });

      expect(mockPrismaNotification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ isRead: true }),
        }),
      );
    });
  });

  describe('getById', () => {
    it('returns notification when found', async () => {
      mockPrismaNotification.findFirst.mockResolvedValue(mockNotification);

      const result = await notificationService.getById('user-1', 'notif-1');

      expect(result.id).toBe('notif-1');
    });

    it('throws 404 when not found', async () => {
      mockPrismaNotification.findFirst.mockResolvedValue(null);

      await expect(notificationService.getById('user-1', 'nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('markAsRead', () => {
    it('marks notification as read', async () => {
      mockPrismaNotification.findFirst.mockResolvedValue(mockNotification);
      mockPrismaNotification.update.mockResolvedValue({ ...mockNotification, isRead: true });

      const result = await notificationService.markAsRead('user-1', 'notif-1');

      expect(result.isRead).toBe(true);
      expect(mockPrismaNotification.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'notif-1' },
          data: { isRead: true },
        }),
      );
    });

    it('throws 404 when not found', async () => {
      mockPrismaNotification.findFirst.mockResolvedValue(null);

      await expect(notificationService.markAsRead('user-1', 'nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('markAllAsRead', () => {
    it('marks all unread notifications as read', async () => {
      mockPrismaNotification.updateMany.mockResolvedValue({ count: 5 });

      await notificationService.markAllAsRead('user-1');

      expect(mockPrismaNotification.updateMany).toHaveBeenCalledWith({
        where: { userId: 'user-1', isRead: false },
        data: { isRead: true },
      });
    });
  });
});
