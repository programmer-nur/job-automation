export interface ApiResponse<T = unknown> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  meta: PaginationMeta;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface QueryParams extends PaginationParams {
  search?: string;
  status?: string;
  [key: string]: unknown;
}

export type JobStatus =
  | "SAVED"
  | "READY_TO_APPLY"
  | "APPLIED"
  | "INTERVIEWING"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN"
  | "ARCHIVED";

export type ApplicationStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "SCREENING"
  | "INTERVIEWING"
  | "OFFER"
  | "REJECTED"
  | "WITHDRAWN"
  | "ACCEPTED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Job {
  id: string;
  userId: string;
  title: string;
  company: string;
  location?: string;
  description?: string;
  url?: string;
  salary?: string;
  status: JobStatus;
  priority: Priority;
  isFavorite: boolean;
  matchScore?: number;
  source?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateJobInput {
  title: string;
  company: string;
  location?: string;
  description?: string;
  url?: string;
  salary?: string;
  status?: JobStatus;
  priority?: Priority;
}

export interface ImportJobInput {
  source: "manual" | "csv" | "linkedin" | "career_page";
  data: Record<string, unknown>;
}

export interface Application {
  id: string;
  jobId: string;
  userId: string;
  status: ApplicationStatus;
  appliedDate?: string;
  followUpDate?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateApplicationInput {
  jobId: string;
  status?: ApplicationStatus;
  appliedDate?: string;
  notes?: string;
}

export interface Resume {
  id: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  isDefault: boolean;
  version: number;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CoverLetter {
  id: string;
  userId: string;
  applicationId?: string;
  jobId?: string;
  content: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface DashboardSummary {
  totalJobs: number;
  applications: number;
  interviews: number;
  offers: number;
  rejections: number;
}

export interface MonthlyAnalytics {
  month: string;
  applications: number;
  interviews: number;
  offers: number;
}

export interface MatchScoreAnalytics {
  range: string;
  count: number;
}

export interface ApplicationSource {
  source: string;
  count: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminJob extends Job {
  user: AdminUser;
}

export interface AdminAiUsage {
  id: string;
  userId: string;
  action: string;
  model: string;
  tokens: number;
  duration: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface HealthCheck {
  status: string;
  database: string;
  redis: string;
  queue: string;
  timestamp: string;
}
