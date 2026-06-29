import type { JobStatus } from "@/store/types/api";

export const STATUS_VARIANT: Record<JobStatus, "info" | "success" | "warning" | "destructive" | "secondary" | "default"> = {
  NEW: "secondary",
  REVIEWING: "info",
  READY_TO_APPLY: "info",
  APPLIED: "info",
  FOLLOW_UP: "warning",
  INTERVIEW: "warning",
  OFFER: "success",
  REJECTED: "destructive",
  CLOSED: "default",
};
