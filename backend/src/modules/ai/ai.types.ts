export interface ParseJobInput {
  jobId: string;
  jobDescription: string;
}

export interface ScoreJobInput {
  jobId: string;
  resumeContent: string;
}

export interface TailorResumeInput {
  resumeId: string;
  jobId: string;
  instructions?: string;
}

export interface GenerateCoverLetterInput {
  jobId: string;
  resumeContent: string;
  tone?: string;
}

export interface SkillGapInput {
  jobId: string;
  resumeContent: string;
}

export interface InterviewPrepInput {
  jobId: string;
  focusArea?: string;
}

export interface ParseJobResult {
  title: string;
  company: string;
  skills: string[];
  experience: string;
  education: string;
  employmentType: string;
  location: string;
}

export interface ScoreMatchResult {
  score: number;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
}

export interface TailorResumeResult {
  content: string;
  changes: string;
}

export interface GenerateCoverLetterResult {
  content: string;
}

export interface SkillGapResult {
  matchedSkills: string[];
  missingSkills: string[];
  suggestions: string[];
}

export interface InterviewPrepResult {
  questions: string[];
  tips: string[];
  topics: string[];
}
