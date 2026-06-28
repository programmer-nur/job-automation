export interface HealthStatus {
  status: string;
  database: string;
  redis: string;
  queue: string;
  timestamp: string;
}
