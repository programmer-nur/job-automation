import type { Express } from 'express';
import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

const mockParseJob = vi.fn();
const mockScoreJob = vi.fn();
const mockTailorResume = vi.fn();
const mockGenerateCoverLetter = vi.fn();
const mockDetectSkillGap = vi.fn();
const mockInterviewPrep = vi.fn();

vi.mock('@/modules/ai/ai.service', () => ({
  aiService: {
    parseJob: mockParseJob,
    scoreJob: mockScoreJob,
    tailorResume: mockTailorResume,
    generateCoverLetter: mockGenerateCoverLetter,
    detectSkillGap: mockDetectSkillGap,
    interviewPrep: mockInterviewPrep,
  },
}));

const mockVerifyAccessToken = vi.hoisted(() => vi.fn());

vi.mock('@/utils/jwt', () => ({
  verifyAccessToken: mockVerifyAccessToken,
}));

let app: Express;

const uuid = '550e8400-e29b-41d4-a716-446655440000';

describe('AI API', () => {
  beforeAll(async () => {
    mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
    const { createApp } = await import('@/app');
    app = createApp();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockVerifyAccessToken.mockReturnValue({ userId: 'user-1', role: 'USER' });
  });

  describe('POST /api/v1/ai/parse-job', () => {
    it('returns 201 on success', async () => {
      mockParseJob.mockResolvedValue({ title: 'Engineer', skills: ['TypeScript'] });

      const res = await request(app)
        .post('/api/v1/ai/parse-job')
        .set('Authorization', 'Bearer token')
        .send({ jobId: uuid, jobDescription: 'Looking for an engineer...' });

      expect(res.status).toBe(201);
      expect(res.body.data).toHaveProperty('title');
    });

    it('returns 422 for invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/ai/parse-job')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(res.status).toBe(422);
    });

    it('returns 401 without auth', async () => {
      const res = await request(app)
        .post('/api/v1/ai/parse-job')
        .send({ jobId: uuid, jobDescription: 'Desc' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/v1/ai/score-job', () => {
    it('returns 201 on success', async () => {
      mockScoreJob.mockResolvedValue({ score: 85, strengths: ['TypeScript'] });

      const res = await request(app)
        .post('/api/v1/ai/score-job')
        .set('Authorization', 'Bearer token')
        .send({ jobId: uuid, resumeContent: '## Experience' });

      expect(res.status).toBe(201);
    });

    it('returns 422 for invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/ai/score-job')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/ai/tailor-resume', () => {
    it('returns 201 on success', async () => {
      mockTailorResume.mockResolvedValue({
        content: '## Tailored Resume',
        changes: 'Added keywords',
      });

      const res = await request(app)
        .post('/api/v1/ai/tailor-resume')
        .set('Authorization', 'Bearer token')
        .send({ resumeId: uuid, jobId: uuid });

      expect(res.status).toBe(201);
    });

    it('returns 422 for invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/ai/tailor-resume')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/ai/generate-cover-letter', () => {
    it('returns 201 on success', async () => {
      mockGenerateCoverLetter.mockResolvedValue({ content: 'Dear Hiring Manager...' });

      const res = await request(app)
        .post('/api/v1/ai/generate-cover-letter')
        .set('Authorization', 'Bearer token')
        .send({ jobId: uuid, resumeContent: '## Resume' });

      expect(res.status).toBe(201);
    });

    it('returns 422 for invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/ai/generate-cover-letter')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/ai/skill-gap', () => {
    it('returns 201 on success', async () => {
      mockDetectSkillGap.mockResolvedValue({ matchedSkills: ['JS'], missingSkills: ['AWS'] });

      const res = await request(app)
        .post('/api/v1/ai/skill-gap')
        .set('Authorization', 'Bearer token')
        .send({ jobId: uuid, resumeContent: '## Resume' });

      expect(res.status).toBe(201);
    });

    it('returns 422 for invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/ai/skill-gap')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(res.status).toBe(422);
    });
  });

  describe('POST /api/v1/ai/interview-prep', () => {
    it('returns 201 on success', async () => {
      mockInterviewPrep.mockResolvedValue({
        questions: ['Tell me about yourself'],
        tips: ['Be concise'],
      });

      const res = await request(app)
        .post('/api/v1/ai/interview-prep')
        .set('Authorization', 'Bearer token')
        .send({ jobId: uuid });

      expect(res.status).toBe(201);
    });

    it('returns 422 for invalid input', async () => {
      const res = await request(app)
        .post('/api/v1/ai/interview-prep')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(res.status).toBe(422);
    });
  });
});
