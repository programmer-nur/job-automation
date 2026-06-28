export interface CreateCoverLetterInput {
  jobId?: string;
  content: string;
  tone?: string;
}

export type UpdateCoverLetterInput = Pick<Partial<CreateCoverLetterInput>, 'content' | 'tone'>;

export interface CoverLetterResponse {
  id: string;
  jobId: string | null;
  content: string;
  tone: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface CoverLetterListParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}
