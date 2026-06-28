import { describe, expect, it } from 'vitest';

import {
  createApplicationSchema,
  updateApplicationSchema,
  applicationStatusSchema,
  followUpSchema,
  notesSchema,
} from '@/modules/applications/applications.validation';

describe('createApplicationSchema', () => {
  it('accepts valid input', () => {
    const result = createApplicationSchema.safeParse({
      jobId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('accepts input with notes', () => {
    const result = createApplicationSchema.safeParse({
      jobId: '550e8400-e29b-41d4-a716-446655440000',
      notes: 'Spoke with recruiter',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing jobId', () => {
    const result = createApplicationSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects invalid UUID', () => {
    const result = createApplicationSchema.safeParse({ jobId: 'not-a-uuid' });
    expect(result.success).toBe(false);
  });

  it('rejects notes exceeding 5000 chars', () => {
    const result = createApplicationSchema.safeParse({
      jobId: '550e8400-e29b-41d4-a716-446655440000',
      notes: 'x'.repeat(5001),
    });
    expect(result.success).toBe(false);
  });
});

describe('updateApplicationSchema', () => {
  it('accepts partial update with notes', () => {
    const result = updateApplicationSchema.safeParse({ notes: 'Updated notes' });
    expect(result.success).toBe(true);
  });

  it('accepts empty body', () => {
    const result = updateApplicationSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('applicationStatusSchema', () => {
  it('accepts valid status', () => {
    const result = applicationStatusSchema.safeParse({ status: 'SUBMITTED' });
    expect(result.success).toBe(true);
  });

  it('accepts all status values', () => {
    const statuses = [
      'DRAFT',
      'SUBMITTED',
      'VIEWED',
      'INTERVIEWING',
      'OFFER',
      'REJECTED',
      'WITHDRAWN',
    ];
    for (const s of statuses) {
      expect(applicationStatusSchema.safeParse({ status: s }).success).toBe(true);
    }
  });

  it('rejects invalid status', () => {
    const result = applicationStatusSchema.safeParse({ status: 'INVALID' });
    expect(result.success).toBe(false);
  });
});

describe('followUpSchema', () => {
  it('accepts valid ISO date', () => {
    const result = followUpSchema.safeParse({ followUpDate: '2026-07-15T10:00:00.000Z' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid date string', () => {
    const result = followUpSchema.safeParse({ followUpDate: 'not-a-date' });
    expect(result.success).toBe(false);
  });
});

describe('notesSchema', () => {
  it('accepts notes', () => {
    const result = notesSchema.safeParse({ notes: 'Some notes' });
    expect(result.success).toBe(true);
  });

  it('accepts null notes', () => {
    const result = notesSchema.safeParse({ notes: null });
    expect(result.success).toBe(true);
  });

  it('rejects notes exceeding 5000 chars', () => {
    const result = notesSchema.safeParse({ notes: 'x'.repeat(5001) });
    expect(result.success).toBe(false);
  });
});
