import type { ResumeVersion } from "@prisma/client";

export interface CreateResumeInput {
  name: string;
  targetRole?: string;
  storageUrl?: string;
}

export interface UpdateResumeInput {
  name?: string;
  targetRole?: string;
  storageUrl?: string;
}

export interface ResumeListParams {
  page: number;
  limit: number;
  isDefault?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TailorInput {
  jobId: string;
}

export interface ResumeResponse {
  id: string;
  name: string;
  targetRole: string | null;
  storageUrl: string | null;
  atsScore: number | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function toResumeResponse(resume: ResumeVersion): ResumeResponse {
  return {
    id: resume.id,
    name: resume.name,
    targetRole: resume.targetRole,
    storageUrl: resume.storageUrl,
    atsScore: resume.atsScore,
    isDefault: resume.isDefault,
    createdAt: resume.createdAt,
    updatedAt: resume.updatedAt,
  };
}
