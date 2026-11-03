"use client";

import { CheckCheck, ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { useMemo, useState } from "react";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/ui/button";
import { NotificationItem } from "@/features/notifications/components/notification-item";
import {
  NotificationEmptyState,
  NotificationErrorState,
  NotificationSkeleton,
} from "@/features/notifications/components/notification-query-state";
import {
  useMarkAllNotificationsRead,
  useNotifications,
  useUnreadCount,
} from "@/features/notifications/hooks/use-notifications";

export function NotificationInboxScreen() {
  const [page, setPage] = useState(0);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const limit = 20;

  const notificationsQuery = useNotifications({ page, limit });
  const unreadCountQuery = useUnreadCount();
  const markAllReadMutation = useMarkAllNotificationsRead();

  const unreadCount = unreadCountQuery.data?.unreadCount ?? 0;
  const pageData = notificationsQuery.data;

  const displayedNotifications = useMemo(() => {
    if (!pageData) return [];
    if (filterUnreadOnly) {
      return pageData.content.filter((n) => !n.isRead);
    }
    return pageData.content;
  }, [pageData, filterUnreadOnly]);

  const handleMarkAllRead = async () => {
    if (unreadCount > 0 && !markAllReadMutation.isPending) {
      await markAllReadMutation.mutateAsync();
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Notifications"
          description="Stay updated with company announcements, leave approvals, and schedule notices."
          actions={
            unreadCount > 0 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={markAllReadMutation.isPending}
              >
                {markAllReadMutation.isPending ? (
                  <LoaderCircle className="mr-1.5 size-4 animate-spin" />
                ) : (
                  <CheckCheck className="mr-1.5 size-4 text-primary" />
                )}
                Mark all as read ({unreadCount})
              </Button>
            ) : undefined
          }
        />

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilterUnreadOnly(false)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              !filterUnreadOnly
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            All notifications
          </button>
          <button
            type="button"
            onClick={() => setFilterUnreadOnly(true)}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filterUnreadOnly
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
            }`}
          >
            Unread only {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>

        {/* Content */}
        {notificationsQuery.isLoading ? (
          <NotificationSkeleton />
        ) : notificationsQuery.isError ? (
          <NotificationErrorState
            message="Unable to load notifications. Please check your connection."
            retry={() => notificationsQuery.refetch()}
          />
        ) : displayedNotifications.length === 0 ? (
          <NotificationEmptyState
            title={
              filterUnreadOnly
                ? "No unread notifications"
                : "No notifications found"
            }
            description={
              filterUnreadOnly
                ? "You have read all your notifications!"
                : "You don't have any notifications at the moment."
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {displayedNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {pageData && (
              <div className="flex flex-col items-center justify-between gap-4 rounded-xl border bg-card px-4 py-3 sm:flex-row">
                <p className="text-xs text-muted-foreground">
                  Showing{" "}
                  <span className="font-semibold text-foreground">
                    {displayedNotifications.length}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-foreground">
                    {pageData.totalElements}
                  </span>{" "}
                  notifications (Page {pageData.page + 1} of{" "}
                  {Math.max(pageData.totalPages, 1)})
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(p - 1, 0))}
                    disabled={pageData.first || page === 0}
                  >
                    <ChevronLeft className="mr-1 size-3.5" />
                    Previous
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={pageData.last || page + 1 >= pageData.totalPages}
                  >
                    Next
                    <ChevronRight className="ml-1 size-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}

