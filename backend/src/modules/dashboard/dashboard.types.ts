export interface SummaryData {
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

export interface MonthlyData {
  monthly: MonthlyEntry[];
}

export interface ScoreBucket {
  range: string;
  count: number;
}

export interface ScoreDistribution {
  scores: ScoreBucket[];
}

export interface SourceEntry {
  source: string;
  count: number;
}

export interface SourceDistribution {
  sources: SourceEntry[];
}
