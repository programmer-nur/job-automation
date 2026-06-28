export const TAG_TYPES = [
  "User",
  "Job",
  "Application",
  "Resume",
  "CoverLetter",
  "Task",
  "Notification",
  "Dashboard",
  "Admin",
] as const;

export type TagType = (typeof TAG_TYPES)[number];
