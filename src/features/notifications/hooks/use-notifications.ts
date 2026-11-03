"use client";

import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  synchronizeMarkAllRead,
  synchronizeNotificationRead,
} from "@/features/notifications/hooks/notification-mutation-utils";
import { notificationKeys } from "@/features/notifications/hooks/notification-query-keys";
import {
  getUnreadCount,
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/services/notification-service";
import type { NotificationListParams } from "@/features/notifications/types/notification-types";
import { useAuth } from "@/providers/auth-provider";

export function notificationsQueryOptions(
  params?: NotificationListParams,
  enabled = true,
) {
  return queryOptions({
    queryKey: notificationKeys.list(params),
    queryFn: () => listNotifications(params),
    placeholderData: (previous) => previous,
    enabled,
  });
}

export function useNotifications(params?: NotificationListParams) {
  const { session } = useAuth();
  const isEmployee = session?.user?.role === "EMPLOYEE";
  return useQuery(notificationsQueryOptions(params, isEmployee));
}

export function unreadCountQueryOptions(enabled = true) {
  return queryOptions({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => getUnreadCount(),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
    enabled,
  });
}

export function useUnreadCount() {
  const { session } = useAuth();
  const isEmployee = session?.user?.role === "EMPLOYEE";
  return useQuery(unreadCountQueryOptions(isEmployee));
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationRead(notificationId),
    onSuccess: () => {
      synchronizeNotificationRead(queryClient);
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => markAllNotificationsRead(),
    onSuccess: () => {
      synchronizeMarkAllRead(queryClient);
    },
  });
}

