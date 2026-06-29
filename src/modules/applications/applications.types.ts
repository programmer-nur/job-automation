import type { Application } from "@prisma/client";

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

export interface ApplicationResponse {
  id: string;
  jobId: string;
  status: string;
  notes: string | null;
  appliedAt: Date | null;
  followUpDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export function toApplicationResponse(app: Application): ApplicationResponse {
  return {
    id: app.id,
    jobId: app.jobId,
    status: app.status,
    notes: app.notes,
    appliedAt: app.appliedAt,
    followUpDate: app.followUpDate,
    createdAt: app.createdAt,
    updatedAt: app.updatedAt,
  };
}
