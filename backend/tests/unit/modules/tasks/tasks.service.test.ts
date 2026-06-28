import { describe, expect, it, vi, beforeEach } from 'vitest';

import { taskService } from '@/modules/tasks/tasks.service';

const mockPrismaTask = vi.hoisted(() => ({
  create: vi.fn(),
  findFirst: vi.fn(),
  findMany: vi.fn(),
  count: vi.fn(),
  update: vi.fn(),
}));

vi.mock('@/config/prisma', () => ({
  prisma: {
    task: mockPrismaTask,
  },
}));

const mockTask = {
  id: 'task-1',
  userId: 'user-1',
  jobId: null,
  applicationId: null,
  title: 'Follow up on application',
  description: null,
  dueDate: null,
  completedAt: null,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  deletedAt: null,
};

const mockTaskResponse = {
  id: mockTask.id,
  jobId: mockTask.jobId,
  applicationId: mockTask.applicationId,
  title: mockTask.title,
  description: mockTask.description,
  dueDate: mockTask.dueDate,
  completedAt: mockTask.completedAt,
  createdAt: mockTask.createdAt,
  updatedAt: mockTask.updatedAt,
};

describe('taskService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('creates a task', async () => {
      mockPrismaTask.create.mockResolvedValue(mockTask);

      const result = await taskService.create('user-1', { title: 'Follow up' });

      expect(result).toMatchObject(mockTaskResponse);
      expect(mockPrismaTask.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          user: { connect: { id: 'user-1' } },
          title: 'Follow up',
        }),
      });
    });
  });

  describe('list', () => {
    it('returns paginated results', async () => {
      mockPrismaTask.findMany.mockResolvedValue([mockTask]);
      mockPrismaTask.count.mockResolvedValue(1);

      const result = await taskService.list('user-1', { page: 1, limit: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('filters by completed status', async () => {
      mockPrismaTask.findMany.mockResolvedValue([]);
      mockPrismaTask.count.mockResolvedValue(0);

      await taskService.list('user-1', { page: 1, limit: 20, status: 'completed' });

      expect(mockPrismaTask.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ completedAt: { not: null } }),
        }),
      );
    });

    it('filters by pending status', async () => {
      mockPrismaTask.findMany.mockResolvedValue([]);
      mockPrismaTask.count.mockResolvedValue(0);

      await taskService.list('user-1', { page: 1, limit: 20, status: 'pending' });

      expect(mockPrismaTask.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ completedAt: null }),
        }),
      );
    });
  });

  describe('getById', () => {
    it('returns task when found', async () => {
      mockPrismaTask.findFirst.mockResolvedValue(mockTask);

      const result = await taskService.getById('user-1', 'task-1');

      expect(result.id).toBe('task-1');
    });

    it('throws 404 when not found', async () => {
      mockPrismaTask.findFirst.mockResolvedValue(null);

      await expect(taskService.getById('user-1', 'nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('update', () => {
    it('updates and returns task', async () => {
      mockPrismaTask.findFirst.mockResolvedValue(mockTask);
      mockPrismaTask.update.mockResolvedValue({ ...mockTask, title: 'Updated' });

      const result = await taskService.update('user-1', 'task-1', { title: 'Updated' });

      expect(result.title).toBe('Updated');
    });

    it('throws 404 when not found', async () => {
      mockPrismaTask.findFirst.mockResolvedValue(null);

      await expect(
        taskService.update('user-1', 'nonexistent', { title: 'New' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('delete', () => {
    it('soft deletes', async () => {
      mockPrismaTask.findFirst.mockResolvedValue(mockTask);
      mockPrismaTask.update.mockResolvedValue({ ...mockTask, deletedAt: new Date() });

      await taskService.delete('user-1', 'task-1');

      expect(mockPrismaTask.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task-1' },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        }),
      );
    });

    it('throws 404 when not found', async () => {
      mockPrismaTask.findFirst.mockResolvedValue(null);

      await expect(taskService.delete('user-1', 'nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('complete', () => {
    it('marks task as completed', async () => {
      mockPrismaTask.findFirst.mockResolvedValue(mockTask);
      mockPrismaTask.update.mockResolvedValue({ ...mockTask, completedAt: new Date() });

      const result = await taskService.complete('user-1', 'task-1');

      expect(result.completedAt).toBeTruthy();
      expect(mockPrismaTask.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task-1' },
          data: expect.objectContaining({ completedAt: expect.any(Date) }),
        }),
      );
    });

    it('throws 404 when not found', async () => {
      mockPrismaTask.findFirst.mockResolvedValue(null);

      await expect(taskService.complete('user-1', 'nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });

  describe('incomplete', () => {
    it('marks task as incomplete', async () => {
      mockPrismaTask.findFirst.mockResolvedValue({ ...mockTask, completedAt: new Date() });
      mockPrismaTask.update.mockResolvedValue({ ...mockTask, completedAt: null });

      const result = await taskService.incomplete('user-1', 'task-1');

      expect(result.completedAt).toBeNull();
      expect(mockPrismaTask.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'task-1' },
          data: { completedAt: null },
        }),
      );
    });

    it('throws 404 when not found', async () => {
      mockPrismaTask.findFirst.mockResolvedValue(null);

      await expect(taskService.incomplete('user-1', 'nonexistent')).rejects.toMatchObject({
        statusCode: 404,
      });
    });
  });
});
