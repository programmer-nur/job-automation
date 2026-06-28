export interface CreateJobInput {
  title: string;
  company: string;
  location?: string;
  description?: string;
  url?: string;
  salaryRange?: string;
  jobType?: string;
  source?: string;
  notes?: string;
}

export type UpdateJobInput = Partial<CreateJobInput>;

export interface JobResponse {
  id: string;
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  url: string | null;
  salaryRange: string | null;
  jobType: string | null;
  source: string | null;
  status: string;
  matchScore: number | null;
  isFavorite: boolean;
  notes: string | null;
  appliedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface JobListParams {
  page: number;
  limit: number;
  status?: string;
  company?: string;
  search?: string;
  favorite?: boolean;
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
