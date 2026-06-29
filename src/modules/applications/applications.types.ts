import type { Application, Job } from "@prisma/client";

export interface CreateApplicationInput {
  jobId: string;
  notes?: string;
}

export interface UpdateApplicationInput {
  notes?: string;
}

export interface ApplicationListParams {
  page: number;
  limit: number;
  status?: string;
  jobId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface JobSummary {
  id: string;
  title: string;
  company: string;
  location: string | null;
}

export interface ApplicationResponse {
  id: string;
  jobId: string;
  status: string;
  notes: string | null;
  appliedAt: Date | null;
  followUpDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  job: JobSummary;
}

type ApplicationWithJob = Application & { job: Pick<Job, "id" | "title" | "company" | "location"> };

export function toApplicationResponse(app: ApplicationWithJob): ApplicationResponse {
  return {
    id: app.id,
    jobId: app.jobId,
    status: app.status,
    notes: app.notes,
    appliedAt: app.appliedAt,
    followUpDate: app.followUpDate,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
    job: {
      id: app.job.id,
      title: app.job.title,
      company: app.job.company,
      location: app.job.location,
    },
  };
}
