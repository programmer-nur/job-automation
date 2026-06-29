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
  | "NEW"
  | "REVIEWING"
  | "READY_TO_APPLY"
  | "APPLIED"
  | "FOLLOW_UP"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "CLOSED";

export type Priority = "LOW" | "MEDIUM" | "HIGH";

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
  status: JobStatus;
  priority: Priority;
  isFavorite: boolean;
  notes: string | null;
  skills: Array<{ id: string; skill: string; category: string | null }>;
  createdAt: string;
  updatedAt: string;
}

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

export interface ImportJobInput {
  source: "manual" | "csv" | "linkedin" | "career_page";
  data: Record<string, unknown>;
}

export interface JobSummary {
  id: string;
  title: string;
  company: string;
  location: string | null;
}

export interface Application {
  id: string;
  jobId: string;
  status: JobStatus;
  notes: string | null;
  appliedAt: string | null;
  followUpDate: string | null;
  createdAt: string;
  updatedAt: string;
  job: JobSummary;
}

export interface CreateApplicationInput {
  jobId: string;
  notes?: string;
}

export interface Resume {
  id: string;
  name: string;
  targetRole: string | null;
  storageUrl: string | null;
  atsScore: number | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CoverLetter {
  id: string;
  jobId: string | null;
  content: string | null;
  storageUrl: string | null;
  createdAt: string;
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
  totalApplications: number;
  activeApplications: number;
  interviews: number;
  offers: number;
  rejections: number;
  pendingTasks: number;
  unreadNotifications: number;
  activeResumes: number;
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
