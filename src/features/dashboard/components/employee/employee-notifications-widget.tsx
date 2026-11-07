import { ArrowRight, Bell, Check } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { useEmployeeDashboard } from "@/features/dashboard/hooks/use-employee-dashboard";
import { formatDateShort } from "@/features/dashboard/utils/dashboard-time";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
} from "@/features/notifications/hooks/use-notifications";
import { cn } from "@/lib/utils";

type EmployeeNotificationsWidgetProps = {
  dashboard: ReturnType<typeof useEmployeeDashboard>;
};

export function EmployeeNotificationsWidget({ dashboard }: EmployeeNotificationsWidgetProps) {
  const { notificationsQuery, unreadCountQuery } = dashboard;
  const notifications = notificationsQuery.data?.content ?? [];
  const unreadCount = unreadCountQuery.data?.unreadCount ?? 0;
  const isLoading = notificationsQuery.isLoading;
  const isError = notificationsQuery.isError;

  const markReadMutation = useMarkNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle>Notifications</CardTitle>
            {unreadCount > 0 && (
              <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning">
                {unreadCount} unread
              </span>
            )}
          </div>
          <CardDescription>Recent alerts, approvals, and system broadcasts.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              className="text-xs text-muted-foreground hover:text-foreground font-medium underline-offset-4 hover:underline"
              disabled={markAllReadMutation.isPending}
              onClick={() => markAllReadMutation.mutate()}
              type="button"
            >
              Mark all read
            </button>
          )}
          <Link
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
            href="/employee/notifications"
          >
            All notifications
            <ArrowRight aria-hidden="true" className="size-3.5 ml-1" />
          </Link>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <p className="text-xs text-destructive">Failed to load notifications.</p>
        ) : notifications.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            <Bell aria-hidden="true" className="mx-auto size-6 text-muted-foreground/60 mb-2" />
            <p className="font-medium text-foreground">No notifications</p>
            <p className="mt-1">You are all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0 text-xs",
                  !item.isRead && "bg-muted/30 px-2 rounded-md -mx-2",
                )}
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="flex items-center gap-2">
                    {!item.isRead && (
                      <span className="size-1.5 rounded-full bg-primary shrink-0" />
                    )}
                    <p className={cn("font-medium text-foreground truncate", !item.isRead && "font-semibold")}>
                      {item.title}
                    </p>
                  </div>
                  <p className="text-muted-foreground line-clamp-2">{item.message}</p>
                  <p className="text-[11px] text-muted-foreground/80 pt-0.5">{formatDateShort(item.createdAt)}</p>
                </div>
                {!item.isRead && (
                  <button
                    aria-label="Mark notification as read"
                    className="text-muted-foreground hover:text-foreground shrink-0 p-1"
                    disabled={markReadMutation.isPending}
                    onClick={() => markReadMutation.mutate(item.id)}
                    title="Mark as read"
                    type="button"
                  >
                    <Check aria-hidden="true" className="size-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

