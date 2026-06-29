import type { Job, JobSkill } from "@prisma/client";

export interface CreateJobInput {
  role: string;
  company: string;
  location?: string;
  employmentType?: string;
  workplaceType?: string;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  source?: string;
  jobUrl?: string;
  description?: string;
  requirements?: string;
  benefits?: string;
  experienceRequired?: string;
  education?: string;
  notes?: string;
}

export interface UpdateJobInput extends Partial<CreateJobInput> {}

export interface JobListParams {
  page: number;
  limit: number;
  status?: string;
  company?: string;
  search?: string;
  favorite?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface JobResponse {
  id: string;
  role: string;
  company: string;
  location: string | null;
  employmentType: string | null;
  workplaceType: string | null;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  source: string | null;
  jobUrl: string | null;
  description: string | null;
  requirements: string | null;
  benefits: string | null;
  experienceRequired: string | null;
  education: string | null;
  matchScore: number | null;
  status: string;
  priority: string;
  isFavorite: boolean;
  notes: string | null;
  skills: Array<{ id: string; skill: string; category: string | null }>;
  createdAt: Date;
  updatedAt: Date;
}

export function toJobResponse(job: Job & { jobSkills?: JobSkill[] }): JobResponse {
  return {
    id: job.id,
    role: job.role,
    company: job.company,
    location: job.location,
    employmentType: job.employmentType,
    workplaceType: job.workplaceType,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    currency: job.currency,
    source: job.source,
    jobUrl: job.jobUrl,
    description: job.description,
    requirements: job.requirements,
    benefits: job.benefits,
    experienceRequired: job.experienceRequired,
    education: job.education,
    matchScore: job.matchScore,
    status: job.status,
    priority: job.priority,
    isFavorite: job.isFavorite,
    notes: (job.metadata as { notes?: string } | null)?.notes ?? null,
    skills: (job.jobSkills ?? []).map((s) => ({
      id: s.id,
      skill: s.skill,
      category: s.category,
    })),
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
  };
}
