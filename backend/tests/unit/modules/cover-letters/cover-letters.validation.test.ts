import { describe, expect, it } from 'vitest';

import {
  createCoverLetterSchema,
  coverLetterListQuerySchema,
  generateCoverLetterSchema,
  updateCoverLetterSchema,
} from '@/modules/cover-letters/cover-letters.validation';

describe('createCoverLetterSchema', () => {
  it('accepts valid input', () => {
    const result = createCoverLetterSchema.safeParse({
      content: 'Dear Hiring Manager...',
      tone: 'professional',
    });
    expect(result.success).toBe(true);
  });

  it('accepts input without tone', () => {
    const result = createCoverLetterSchema.safeParse({
      content: 'Dear Hiring Manager...',
    });
    expect(result.success).toBe(true);
  });

  it('accepts input with jobId', () => {
    const result = createCoverLetterSchema.safeParse({
      content: 'Dear Hiring Manager...',
      jobId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing content', () => {
    const result = createCoverLetterSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects invalid jobId UUID', () => {
    const result = createCoverLetterSchema.safeParse({
      content: 'Content',
      jobId: 'not-a-uuid',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateCoverLetterSchema', () => {
  it('accepts content update', () => {
    const result = updateCoverLetterSchema.safeParse({ content: 'Updated content' });
    expect(result.success).toBe(true);
  });

  it('accepts empty body', () => {
    const result = updateCoverLetterSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('generateCoverLetterSchema', () => {
  it('accepts valid input', () => {
    const result = generateCoverLetterSchema.safeParse({
      jobId: '550e8400-e29b-41d4-a716-446655440000',
      tone: 'professional',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing jobId', () => {
    const result = generateCoverLetterSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('coverLetterListQuerySchema', () => {
  it('provides defaults', () => {
    const result = coverLetterListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });
});
