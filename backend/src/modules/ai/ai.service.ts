import { AppError } from '@/common/errors';
import { MockAIProvider } from '@/modules/ai/ai.client';
import { aiRepository } from '@/modules/ai/ai.repository';
import type {
  GenerateCoverLetterInput,
  InterviewPrepInput,
  ParseJobInput,
  ScoreJobInput,
  SkillGapInput,
  TailorResumeInput,
} from '@/modules/ai/ai.types';
import { jobRepository } from '@/modules/jobs/jobs.repository';
import { resumeRepository } from '@/modules/resumes/resumes.repository';

const aiClient = new MockAIProvider();

async function logRequest<T>(
  userId: string,
  type: string,
  prompt: object,
  handler: () => T,
): Promise<T> {
  const startTime = Date.now();

  const request = await aiRepository.create({
    user: { connect: { id: userId } },
    type,
    prompt: JSON.stringify(prompt),
    model: 'mock',
    status: 'processing',
  });

  try {
    const result = handler();
    const durationMs = Date.now() - startTime;

    await aiRepository.update(request.id, {
      response: JSON.stringify(result),
      status: 'completed',
      durationMs,
    });

    return result;
  } catch (err) {
    const durationMs = Date.now() - startTime;

    await aiRepository.update(request.id, {
      status: 'failed',
      errorMessage: err instanceof Error ? err.message : 'Unknown error',
      durationMs,
    });

    throw err;
  }
}

export const aiService = {
  async parseJob(userId: string, input: ParseJobInput) {
    const job = await jobRepository.findById(userId, input.jobId);
    if (!job) {
      throw AppError.notFound('Job');
    }

    return logRequest(userId, 'parse_job', input, () => aiClient.parseJob(input.jobDescription));
  },

  async scoreJob(userId: string, input: ScoreJobInput) {
    const job = await jobRepository.findById(userId, input.jobId);
    if (!job) {
      throw AppError.notFound('Job');
    }

    return logRequest(userId, 'score_job', input, () =>
      aiClient.scoreMatch(input.resumeContent, job.description || ''),
    );
  },

  async tailorResume(userId: string, input: TailorResumeInput) {
    const resume = await resumeRepository.findById(userId, input.resumeId);
    if (!resume) {
      throw AppError.notFound('Resume');
    }

    const job = await jobRepository.findById(userId, input.jobId);
    if (!job) {
      throw AppError.notFound('Job');
    }

    return logRequest(userId, 'tailor_resume', input, () =>
      aiClient.tailorResume(resume.content, job.description || '', input.instructions),
    );
  },

  async generateCoverLetter(userId: string, input: GenerateCoverLetterInput) {
    const job = await jobRepository.findById(userId, input.jobId);
    if (!job) {
      throw AppError.notFound('Job');
    }

    return logRequest(userId, 'generate_cover_letter', input, () =>
      aiClient.generateCoverLetter(input.resumeContent, job.description || '', input.tone),
    );
  },

  async detectSkillGap(userId: string, input: SkillGapInput) {
    const job = await jobRepository.findById(userId, input.jobId);
    if (!job) {
      throw AppError.notFound('Job');
    }

    return logRequest(userId, 'skill_gap', input, () =>
      aiClient.detectSkillGap(input.resumeContent, job.description || ''),
    );
  },

  async interviewPrep(userId: string, input: InterviewPrepInput) {
    const job = await jobRepository.findById(userId, input.jobId);
    if (!job) {
      throw AppError.notFound('Job');
    }

    return logRequest(userId, 'interview_prep', input, () =>
      aiClient.interviewPrep(job.description || '', input.focusArea),
    );
  },
};
