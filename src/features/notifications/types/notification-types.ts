export type NotificationType =
  | "HOLIDAY_ANNOUNCEMENT"
  | "LEAVE_APPROVED"
  | "LEAVE_REJECTED";

export interface NotificationResponse {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  referenceId: string | null;
  isRead: boolean;
  readAt: string | null; // ISO 8601
  createdAt: string; // ISO 8601
}

export interface NotificationPageResponse {
  content: NotificationResponse[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
}

