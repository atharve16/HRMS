import type {
  NotificationListParams,
  NotificationPageResponse,
  NotificationResponse,
  UnreadCountResponse,
} from "@/features/notifications/types/notification-types";
import type { ApiResponse } from "@/services/api-contract";
import { apiClient } from "@/services/api-client";

export async function listNotifications(
  params?: NotificationListParams,
): Promise<NotificationPageResponse> {
  const response = await apiClient.get<ApiResponse<NotificationPageResponse>>(
    "/notifications",
    { params },
  );
  return response.data.data;
}

export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const response = await apiClient.get<ApiResponse<UnreadCountResponse>>(
    "/notifications/unread-count",
  );
  return response.data.data;
}

export async function markNotificationRead(
  notificationId: string,
): Promise<NotificationResponse> {
  const response = await apiClient.patch<ApiResponse<NotificationResponse>>(
    `/notifications/${encodeURIComponent(notificationId)}/read`,
  );
  return response.data.data;
}

export async function markAllNotificationsRead(): Promise<UnreadCountResponse> {
  const response = await apiClient.patch<ApiResponse<UnreadCountResponse>>(
    "/notifications/read-all",
  );
  return response.data.data;
}

