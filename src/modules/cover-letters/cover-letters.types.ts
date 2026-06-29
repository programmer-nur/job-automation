import type { CoverLetter } from "@prisma/client";

export interface CreateCoverLetterInput {
  jobId?: string;
  content: string;
  storageUrl?: string;
}

export interface UpdateCoverLetterInput {
  content?: string;
  storageUrl?: string;
}

export interface CoverLetterListParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GenerateCoverLetterInput {
  jobId: string;
}

export interface CoverLetterResponse {
  id: string;
  jobId: string | null;
  content: string | null;
  storageUrl: string | null;
  createdAt: Date;
}

export function toCoverLetterResponse(cl: CoverLetter): CoverLetterResponse {
  return {
    id: cl.id,
    jobId: cl.jobId,
    content: cl.content,
    storageUrl: cl.storageUrl,
    createdAt: cl.createdAt,
  };
}
