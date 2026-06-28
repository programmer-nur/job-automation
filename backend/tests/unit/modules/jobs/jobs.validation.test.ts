import { describe, expect, it } from 'vitest';

import {
  createJobSchema,
  updateJobSchema,
  jobStatusSchema,
  favoriteSchema,
} from '@/modules/jobs/jobs.validation';

describe('createJobSchema', () => {
  it('accepts valid input', () => {
    const result = createJobSchema.safeParse({
      title: 'Software Engineer',
      company: 'Google',
      location: 'Mountain View, CA',
      description: 'Join our team',
      url: 'https://careers.google.com/123',
      salaryRange: '$150k - $200k',
      jobType: 'FULL_TIME',
      source: 'linkedin',
    });
    expect(result.success).toBe(true);
  });

  it('accepts minimal input (only required fields)', () => {
    const result = createJobSchema.safeParse({
      title: 'Engineer',
      company: 'Acme',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing title', () => {
    const result = createJobSchema.safeParse({ company: 'Acme' });
    expect(result.success).toBe(false);
  });

  it('rejects missing company', () => {
    const result = createJobSchema.safeParse({ title: 'Engineer' });
    expect(result.success).toBe(false);
  });

  it('rejects empty title', () => {
    const result = createJobSchema.safeParse({ title: '', company: 'Acme' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid url', () => {
    const result = createJobSchema.safeParse({
      title: 'Engineer',
      company: 'Acme',
      url: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('rejects description exceeding 10000 chars', () => {
    const result = createJobSchema.safeParse({
      title: 'Engineer',
      company: 'Acme',
      description: 'x'.repeat(10001),
    });
    expect(result.success).toBe(false);
  });

  it('rejects title exceeding 255 chars', () => {
    const result = createJobSchema.safeParse({
      title: 'x'.repeat(256),
      company: 'Acme',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateJobSchema', () => {
  it('accepts partial update', () => {
    const result = updateJobSchema.safeParse({ title: 'New Title' });
    expect(result.success).toBe(true);
  });

  it('accepts empty body (no fields)', () => {
    const result = updateJobSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects invalid url in update', () => {
    const result = updateJobSchema.safeParse({ url: 'bad' });
    expect(result.success).toBe(false);
  });
});

describe('jobStatusSchema', () => {
  it('accepts valid status', () => {
    const result = jobStatusSchema.safeParse({ status: 'READY_TO_APPLY' });
    expect(result.success).toBe(true);
  });

  it('accepts all job status values', () => {
    const statuses = [
      'SAVED',
      'READY_TO_APPLY',
      'APPLIED',
      'INTERVIEWING',
      'OFFER',
      'REJECTED',
      'WITHDRAWN',
      'ARCHIVED',
    ];
    for (const status of statuses) {
      expect(jobStatusSchema.safeParse({ status }).success).toBe(true);
    }
  });

  it('rejects invalid status', () => {
    const result = jobStatusSchema.safeParse({ status: 'INVALID_STATUS' });
    expect(result.success).toBe(false);
  });
});

describe('favoriteSchema', () => {
  it('accepts true', () => {
    const result = favoriteSchema.safeParse({ isFavorite: true });
    expect(result.success).toBe(true);
  });

  it('accepts false', () => {
    const result = favoriteSchema.safeParse({ isFavorite: false });
    expect(result.success).toBe(true);
  });

  it('rejects non-boolean', () => {
    const result = favoriteSchema.safeParse({ isFavorite: 'yes' });
    expect(result.success).toBe(false);
  });
});
