import type { NotificationListParams } from "@/features/notifications/types/notification-types";

export const notificationKeys = {
  all: ["notifications"] as const,
  inbox: () => [...notificationKeys.all, "inbox"] as const,
  list: (params?: NotificationListParams) =>
    [...notificationKeys.inbox(), params] as const,
  unreadCount: () => [...notificationKeys.all, "unread-count"] as const,
};

