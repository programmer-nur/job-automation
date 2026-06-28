export interface CreateResumeInput {
  title?: string;
  content: string;
  fileUrl?: string;
}

export type UpdateResumeInput = Pick<Partial<CreateResumeInput>, 'title' | 'content' | 'fileUrl'>;

export interface ResumeResponse {
  id: string;
  version: number;
  title: string | null;
  content: string;
  fileUrl: string | null;
  matchScore: number | null;
  isActive: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ResumeListParams {
  page: number;
  limit: number;
  isActive?: boolean;
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
