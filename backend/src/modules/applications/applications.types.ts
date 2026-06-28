export interface CreateApplicationInput {
  jobId: string;
  notes?: string;
}

export type UpdateApplicationInput = Partial<Pick<CreateApplicationInput, 'notes'>>;

export interface ApplicationResponse {
  id: string;
  jobId: string;
  status: string;
  notes: string | null;
  followUpDate: string | Date | null;
  submittedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface ApplicationListParams {
  page: number;
  limit: number;
  status?: string;
  jobId?: string;
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
