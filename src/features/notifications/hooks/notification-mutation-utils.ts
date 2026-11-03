import type { QueryClient } from "@tanstack/react-query";

import { notificationKeys } from "@/features/notifications/hooks/notification-query-keys";
import type { UnreadCountResponse } from "@/features/notifications/types/notification-types";

export function synchronizeNotificationRead(queryClient: QueryClient) {
  // Update unread count query cache
  queryClient.setQueryData<UnreadCountResponse>(
    notificationKeys.unreadCount(),
    (previous) => {
      if (!previous) return { unreadCount: 0 };
      return { unreadCount: Math.max(0, previous.unreadCount - 1) };
    },
  );

  // Invalidate unread count and inbox list queries
  void queryClient.invalidateQueries({
    queryKey: notificationKeys.unreadCount(),
  });
  void queryClient.invalidateQueries({
    queryKey: notificationKeys.inbox(),
  });
}

export function synchronizeMarkAllRead(queryClient: QueryClient) {
  // Set unread count directly to 0
  queryClient.setQueryData<UnreadCountResponse>(
    notificationKeys.unreadCount(),
    { unreadCount: 0 },
  );

  // Invalidate inbox list
  void queryClient.invalidateQueries({
    queryKey: notificationKeys.inbox(),
  });
}

