import { describe, expect, it, vi, beforeEach } from 'vitest';

import { aiService } from '@/modules/ai/ai.service';

const mockPrismaAIRequest = vi.hoisted(() => ({
  create: vi.fn(),
  update: vi.fn(),
}));

const mockJobFindById = vi.hoisted(() => vi.fn());
const mockResumeFindById = vi.hoisted(() => vi.fn());

vi.mock('@/config/prisma', () => ({
  prisma: {
    aIRequest: mockPrismaAIRequest,
  },
}));

vi.mock('@/modules/jobs/jobs.repository', () => ({
  jobRepository: {
    findById: mockJobFindById,
  },
}));

vi.mock('@/modules/resumes/resumes.repository', () => ({
  resumeRepository: {
    findById: mockResumeFindById,
  },
}));

const mockJob = { id: 'job-1', userId: 'user-1', title: 'Engineer', company: 'Google' };
const mockResume = { id: 'res-1', userId: 'user-1', title: 'Resume', content: '## Experience' };

const mockAIRequest = {
  id: 'req-1',
  userId: 'user-1',
  type: 'parse_job',
  prompt: '{}',
  response: '{}',
  model: 'mock',
  tokensUsed: null,
  durationMs: null,
  status: 'completed',
  errorMessage: null,
};

describe('aiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrismaAIRequest.create.mockResolvedValue(mockAIRequest);
    mockPrismaAIRequest.update.mockResolvedValue(mockAIRequest);
  });

  describe('parseJob', () => {
    it('returns parsed job data', async () => {
      mockJobFindById.mockResolvedValue(mockJob);

      const result = await aiService.parseJob('user-1', {
        jobId: 'job-1',
        jobDescription: 'Looking for a senior engineer...',
      });

      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('skills');
      expect(mockPrismaAIRequest.create).toHaveBeenCalled();
    });

    it('throws 404 when job not found', async () => {
      mockJobFindById.mockResolvedValue(null);

      await expect(
        aiService.parseJob('user-1', { jobId: 'nonexistent', jobDescription: 'Desc' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('scoreJob', () => {
    it('returns match score', async () => {
      mockJobFindById.mockResolvedValue(mockJob);

      const result = await aiService.scoreJob('user-1', {
        jobId: 'job-1',
        resumeContent: '## Experience',
      });

      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('strengths');
    });

    it('throws 404 when job not found', async () => {
      mockJobFindById.mockResolvedValue(null);

      await expect(
        aiService.scoreJob('user-1', { jobId: 'nonexistent', resumeContent: 'Resume' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('tailorResume', () => {
    it('returns tailored resume', async () => {
      mockJobFindById.mockResolvedValue(mockJob);
      mockResumeFindById.mockResolvedValue(mockResume);

      const result = await aiService.tailorResume('user-1', {
        resumeId: 'res-1',
        jobId: 'job-1',
      });

      expect(result).toHaveProperty('content');
    });

    it('throws 404 when resume not found', async () => {
      mockResumeFindById.mockResolvedValue(null);

      await expect(
        aiService.tailorResume('user-1', { resumeId: 'nonexistent', jobId: 'job-1' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it('throws 404 when job not found', async () => {
      mockResumeFindById.mockResolvedValue(mockResume);
      mockJobFindById.mockResolvedValue(null);

      await expect(
        aiService.tailorResume('user-1', { resumeId: 'res-1', jobId: 'nonexistent' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('generateCoverLetter', () => {
    it('returns cover letter', async () => {
      mockJobFindById.mockResolvedValue(mockJob);

      const result = await aiService.generateCoverLetter('user-1', {
        jobId: 'job-1',
        resumeContent: '## Experience',
      });

      expect(result).toHaveProperty('content');
    });

    it('throws 404 when job not found', async () => {
      mockJobFindById.mockResolvedValue(null);

      await expect(
        aiService.generateCoverLetter('user-1', { jobId: 'nonexistent', resumeContent: 'Resume' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('detectSkillGap', () => {
    it('returns skill gap analysis', async () => {
      mockJobFindById.mockResolvedValue(mockJob);

      const result = await aiService.detectSkillGap('user-1', {
        jobId: 'job-1',
        resumeContent: '## Experience',
      });

      expect(result).toHaveProperty('matchedSkills');
      expect(result).toHaveProperty('missingSkills');
    });

    it('throws 404 when job not found', async () => {
      mockJobFindById.mockResolvedValue(null);

      await expect(
        aiService.detectSkillGap('user-1', { jobId: 'nonexistent', resumeContent: 'Resume' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });

  describe('interviewPrep', () => {
    it('returns interview prep', async () => {
      mockJobFindById.mockResolvedValue(mockJob);

      const result = await aiService.interviewPrep('user-1', {
        jobId: 'job-1',
      });

      expect(result).toHaveProperty('questions');
      expect(result).toHaveProperty('tips');
    });

    it('throws 404 when job not found', async () => {
      mockJobFindById.mockResolvedValue(null);

      await expect(
        aiService.interviewPrep('user-1', { jobId: 'nonexistent' }),
      ).rejects.toMatchObject({ statusCode: 404 });
    });
  });
});
