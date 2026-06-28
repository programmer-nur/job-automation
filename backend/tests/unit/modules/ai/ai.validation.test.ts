import { describe, expect, it } from 'vitest';

import {
  generateCoverLetterSchema,
  interviewPrepSchema,
  parseJobSchema,
  scoreJobSchema,
  skillGapSchema,
  tailorResumeSchema,
} from '@/modules/ai/ai.validation';

describe('parseJobSchema', () => {
  it('accepts valid input', () => {
    const result = parseJobSchema.safeParse({
      jobId: '550e8400-e29b-41d4-a716-446655440000',
      jobDescription: 'We are looking for a senior engineer...',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing jobId', () => {
    const result = parseJobSchema.safeParse({ jobDescription: 'Description' });
    expect(result.success).toBe(false);
  });

  it('rejects missing jobDescription', () => {
    const result = parseJobSchema.safeParse({ jobId: '550e8400-e29b-41d4-a716-446655440000' });
    expect(result.success).toBe(false);
  });
});

describe('scoreJobSchema', () => {
  it('accepts valid input', () => {
    const result = scoreJobSchema.safeParse({
      jobId: '550e8400-e29b-41d4-a716-446655440000',
      resumeContent: '## Experience\nEngineer at Google',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing resumeContent', () => {
    const result = scoreJobSchema.safeParse({ jobId: '550e8400-e29b-41d4-a716-446655440000' });
    expect(result.success).toBe(false);
  });
});

describe('tailorResumeSchema', () => {
  it('accepts valid input', () => {
    const result = tailorResumeSchema.safeParse({
      resumeId: '550e8400-e29b-41d4-a716-446655440000',
      jobId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('accepts optional instructions', () => {
    const result = tailorResumeSchema.safeParse({
      resumeId: '550e8400-e29b-41d4-a716-446655440000',
      jobId: '550e8400-e29b-41d4-a716-446655440000',
      instructions: 'Emphasize leadership',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing resumeId', () => {
    const result = tailorResumeSchema.safeParse({ jobId: 'uuid' });
    expect(result.success).toBe(false);
  });
});

describe('generateCoverLetterSchema', () => {
  it('accepts valid input', () => {
    const result = generateCoverLetterSchema.safeParse({
      jobId: '550e8400-e29b-41d4-a716-446655440000',
      resumeContent: '## Experience',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing resumeContent', () => {
    const result = generateCoverLetterSchema.safeParse({ jobId: 'uuid' });
    expect(result.success).toBe(false);
  });
});

describe('skillGapSchema', () => {
  it('accepts valid input', () => {
    const result = skillGapSchema.safeParse({
      jobId: '550e8400-e29b-41d4-a716-446655440000',
      resumeContent: '## Experience',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing resumeContent', () => {
    const result = skillGapSchema.safeParse({ jobId: 'uuid' });
    expect(result.success).toBe(false);
  });
});

describe('interviewPrepSchema', () => {
  it('accepts valid input', () => {
    const result = interviewPrepSchema.safeParse({
      jobId: '550e8400-e29b-41d4-a716-446655440000',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing jobId', () => {
    const result = interviewPrepSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
