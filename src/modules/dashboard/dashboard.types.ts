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

export interface MonthlyEntry {
  month: string;
  applications: number;
  interviews: number;
  offers: number;
}

export interface MatchScoreEntry {
  range: string;
  count: number;
}

export interface SourceEntry {
  source: string;
  count: number;
}
