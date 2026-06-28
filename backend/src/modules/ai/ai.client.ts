import type {
  GenerateCoverLetterResult,
  InterviewPrepResult,
  ParseJobResult,
  ScoreMatchResult,
  SkillGapResult,
  TailorResumeResult,
} from '@/modules/ai/ai.types';

export interface AIClient {
  parseJob(description: string): ParseJobResult;
  scoreMatch(resume: string, jobDescription: string): ScoreMatchResult;
  tailorResume(resume: string, jobDescription: string, instructions?: string): TailorResumeResult;
  generateCoverLetter(
    resume: string,
    jobDescription: string,
    tone?: string,
  ): GenerateCoverLetterResult;
  detectSkillGap(resume: string, jobDescription: string): SkillGapResult;
  interviewPrep(jobDescription: string, focusArea?: string): InterviewPrepResult;
}

export class MockAIProvider implements AIClient {
  parseJob(_description: string): ParseJobResult {
    return {
      title: 'Software Engineer',
      company: 'Tech Corp',
      skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS'],
      experience: '5+ years',
      education: "Bachelor's in Computer Science",
      employmentType: 'Full-time',
      location: 'Remote',
    };
  }

  scoreMatch(_resume: string, _jobDescription: string): ScoreMatchResult {
    return {
      score: 78,
      strengths: ['Strong TypeScript experience', 'React expertise', 'Node.js backend knowledge'],
      gaps: ['Missing AWS experience', 'No container orchestration (Kubernetes)'],
      suggestions: [
        'Add AWS certifications to your resume',
        'Highlight any Docker/Kubernetes experience',
        'Emphasize system design skills',
      ],
    };
  }

  tailorResume(
    resume: string,
    _jobDescription: string,
    _instructions?: string,
  ): TailorResumeResult {
    return {
      content: resume + '\n\n[AI-tailored additions based on job description]',
      changes:
        'Added relevant keywords from job description, reordered skills to match requirements, emphasized leadership experience',
    };
  }

  generateCoverLetter(
    _resume: string,
    _jobDescription: string,
    tone?: string,
  ): GenerateCoverLetterResult {
    return {
      content: `Dear Hiring Manager,\n\nI am writing to express my strong interest in the position. With my background in software engineering and passion for building great products, I am confident that I would be an excellent addition to your team.\n\n${tone ? `[This cover letter is written in a ${tone} tone.]` : ''}\n\nBest regards,\n[Your Name]`,
    };
  }

  detectSkillGap(_resume: string, _jobDescription: string): SkillGapResult {
    return {
      matchedSkills: ['TypeScript', 'React', 'Node.js'],
      missingSkills: ['AWS', 'Kubernetes', 'Docker', 'GraphQL'],
      suggestions: [
        'Consider getting AWS Certified Developer certification',
        'Build a project using Docker and Kubernetes',
        'Learn GraphQL through online courses',
      ],
    };
  }

  interviewPrep(_jobDescription: string, _focusArea?: string): InterviewPrepResult {
    return {
      questions: [
        'Tell me about a challenging technical problem you solved',
        'How do you approach system design?',
        'Describe your experience with agile methodologies',
        'How do you stay current with new technologies?',
      ],
      tips: [
        'Use the STAR method for behavioral questions',
        'Prepare concrete examples of your impact',
        'Research the company culture beforehand',
        'Prepare thoughtful questions to ask the interviewer',
      ],
      topics: [
        'System Design & Architecture',
        'Data Structures & Algorithms',
        'Frontend Performance Optimization',
        'CI/CD and DevOps Practices',
      ],
    };
  }
}
