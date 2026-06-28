import { describe, expect, it } from 'vitest';

import {
  createResumeSchema,
  resumeListQuerySchema,
  tailorResumeSchema,
  updateResumeSchema,
} from '@/modules/resumes/resumes.validation';

describe('createResumeSchema', () => {
  it('accepts valid input', () => {
    const result = createResumeSchema.safeParse({
      title: 'Frontend Engineer Resume',
      content: '## Experience\nWorked at Google...',
    });
    expect(result.success).toBe(true);
  });

  it('accepts input without title', () => {
    const result = createResumeSchema.safeParse({
      content: '## Experience\nWorked at Google...',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing content', () => {
    const result = createResumeSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects title exceeding 255 chars', () => {
    const result = createResumeSchema.safeParse({
      title: 'x'.repeat(256),
      content: 'Valid content',
    });
    expect(result.success).toBe(false);
  });

  it('rejects content exceeding 50000 chars', () => {
    const result = createResumeSchema.safeParse({
      content: 'x'.repeat(50001),
    });
    expect(result.success).toBe(false);
  });

  it('accepts input with fileUrl', () => {
    const result = createResumeSchema.safeParse({
      title: 'Resume',
      content: 'Content',
      fileUrl: 'https://storage.example.com/resume.pdf',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid fileUrl', () => {
    const result = createResumeSchema.safeParse({
      title: 'Resume',
      content: 'Content',
      fileUrl: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateResumeSchema', () => {
  it('accepts partial update', () => {
    const result = updateResumeSchema.safeParse({ title: 'Updated title' });
    expect(result.success).toBe(true);
  });

  it('accepts empty body', () => {
    const result = updateResumeSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('tailorResumeSchema', () => {
  it('accepts valid input', () => {
    const result = tailorResumeSchema.safeParse({
      jobId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing jobId', () => {
    const result = tailorResumeSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('resumeListQuerySchema', () => {
  it('provides defaults', () => {
    const result = resumeListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it('accepts isActive filter', () => {
    const result = resumeListQuerySchema.safeParse({ isActive: 'true' });
    expect(result.success).toBe(true);
  });
});
