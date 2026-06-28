import { z } from 'zod';

export const parseJobSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  jobDescription: z.string().min(1, 'Job description is required').max(50000),
});

export const scoreJobSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  resumeContent: z.string().min(1, 'Resume content is required').max(50000),
});

export const tailorResumeSchema = z.object({
  resumeId: z.string().uuid('Invalid resume ID'),
  jobId: z.string().uuid('Invalid job ID'),
  instructions: z.string().max(2000).optional(),
});

export const generateCoverLetterSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  resumeContent: z.string().min(1, 'Resume content is required').max(50000),
  tone: z.string().max(50).optional(),
});

export const skillGapSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  resumeContent: z.string().min(1, 'Resume content is required').max(50000),
});

export const interviewPrepSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  focusArea: z.string().max(100).optional(),
});
