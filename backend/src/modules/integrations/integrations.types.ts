export interface SyncResult {
  success: boolean;
  message: string;
  timestamp: string;
  details?: Record<string, number>;
}

export interface ExportData {
  jobs: Array<{
    id: string;
    title: string;
    company: string;
    status: string;
    matchScore: number | null;
    createdAt: string;
  }>;
  applications: Array<{
    id: string;
    jobTitle: string;
    company: string;
    status: string;
    createdAt: string;
  }>;
}

export interface CardResult {
  cardId: string;
  url: string;
}

export interface SyncJobData {
  userId: string;
  jobId?: string;
}

export interface TrelloList {
  id: string;
  name: string;
}

export interface SheetExportResult {
  data: ExportData;
  exportedAt: string;
}
