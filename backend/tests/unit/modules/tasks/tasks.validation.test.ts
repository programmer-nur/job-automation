import { describe, expect, it } from 'vitest';

import {
  createTaskSchema,
  taskListQuerySchema,
  updateTaskSchema,
} from '@/modules/tasks/tasks.validation';

describe('createTaskSchema', () => {
  it('accepts valid input with just title', () => {
    const result = createTaskSchema.safeParse({ title: 'Follow up on application' });
    expect(result.success).toBe(true);
  });

  it('accepts input with all fields', () => {
    const result = createTaskSchema.safeParse({
      title: 'Follow up',
      description: 'Send a follow-up email',
      dueDate: '2026-07-15T10:00:00.000Z',
      jobId: '550e8400-e29b-41d4-a716-446655440000',
      applicationId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing title', () => {
    const result = createTaskSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects title exceeding 500 chars', () => {
    const result = createTaskSchema.safeParse({ title: 'x'.repeat(501) });
    expect(result.success).toBe(false);
  });

  it('rejects invalid dueDate', () => {
    const result = createTaskSchema.safeParse({
      title: 'Task',
      dueDate: 'not-a-date',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid jobId UUID', () => {
    const result = createTaskSchema.safeParse({
      title: 'Task',
      jobId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateTaskSchema', () => {
  it('accepts title update', () => {
    const result = updateTaskSchema.safeParse({ title: 'Updated title' });
    expect(result.success).toBe(true);
  });

  it('accepts empty body', () => {
    const result = updateTaskSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('taskListQuerySchema', () => {
  it('provides defaults', () => {
    const result = taskListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it('accepts status=completed', () => {
    const result = taskListQuerySchema.safeParse({ status: 'completed' });
    expect(result.success).toBe(true);
  });

  it('accepts status=pending', () => {
    const result = taskListQuerySchema.safeParse({ status: 'pending' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = taskListQuerySchema.safeParse({ status: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid sortBy', () => {
    const result = taskListQuerySchema.safeParse({ sortBy: 'invalid' });
    expect(result.success).toBe(false);
  });
});
