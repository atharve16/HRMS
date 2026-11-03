import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import {
  synchronizeMarkAllRead,
  synchronizeNotificationRead,
} from "@/features/notifications/hooks/notification-mutation-utils";
import { notificationKeys } from "@/features/notifications/hooks/notification-query-keys";

describe("notification-mutation-utils", () => {
  it("synchronizes query cache when a single notification is marked as read", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(notificationKeys.unreadCount(), { unreadCount: 5 });

    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    synchronizeNotificationRead(queryClient);

    const countData = queryClient.getQueryData<{ unreadCount: number }>(
      notificationKeys.unreadCount(),
    );
    expect(countData?.unreadCount).toBe(4);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: notificationKeys.unreadCount(),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: notificationKeys.inbox(),
    });
  });

  it("synchronizes query cache when all notifications are marked as read", () => {
    const queryClient = new QueryClient();
    queryClient.setQueryData(notificationKeys.unreadCount(), { unreadCount: 5 });

    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    synchronizeMarkAllRead(queryClient);

    const countData = queryClient.getQueryData<{ unreadCount: number }>(
      notificationKeys.unreadCount(),
    );
    expect(countData?.unreadCount).toBe(0);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: notificationKeys.inbox(),
    });
  });
});

