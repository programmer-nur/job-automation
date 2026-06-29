import type { Notification } from "@prisma/client";

export interface CreateNotificationInput {
  title: string;
  message?: string;
  taskId?: string;
}

export interface NotificationListParams {
  page: number;
  limit: number;
  isRead?: boolean;
}

export interface NotificationResponse {
  id: string;
  title: string;
  message: string | null;
  isRead: boolean;
  createdAt: Date;
}

export function toNotificationResponse(n: Notification): NotificationResponse {
  return {
    id: n.id,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    createdAt: n.createdAt,
  };
}
