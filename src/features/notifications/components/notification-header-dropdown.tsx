"use client";

import { Bell, CheckCheck, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NotificationItem } from "@/features/notifications/components/notification-item";
import {
  useMarkAllNotificationsRead,
  useNotifications,
  useUnreadCount,
} from "@/features/notifications/hooks/use-notifications";
import { useAuth } from "@/providers/auth-provider";

export function NotificationHeaderDropdown() {
  const { session } = useAuth();
  const isEmployee = session?.user?.role === "EMPLOYEE";
  const [open, setOpen] = useState(false);

  const unreadCountQuery = useUnreadCount();
  const notificationsQuery = useNotifications({ page: 0, limit: 5 });
  const markAllReadMutation = useMarkAllNotificationsRead();

  if (!isEmployee) {
    return (
      <Button
        aria-label="Notifications"
        className="relative text-muted-foreground opacity-60"
        size="icon"
        variant="ghost"
        disabled
        title="Notifications are active for employee accounts"
      >
        <Bell aria-hidden="true" className="size-5" />
      </Button>
    );
  }

  const unreadCount = unreadCountQuery.data?.unreadCount ?? 0;
  const notifications = notificationsQuery.data?.content ?? [];

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (unreadCount > 0 && !markAllReadMutation.isPending) {
      await markAllReadMutation.mutateAsync();
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label="Notifications"
          className="relative"
          size="icon"
          variant="ghost"
        >
          <Bell aria-hidden="true" className="size-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground animate-in zoom-in-50">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              Notifications
            </span>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                {unreadCount} unread
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
              onClick={handleMarkAllRead}
              disabled={markAllReadMutation.isPending}
            >
              {markAllReadMutation.isPending ? (
                <LoaderCircle className="mr-1 size-3 animate-spin" />
              ) : (
                <CheckCheck className="mr-1 size-3" />
              )}
              Mark all read
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto divide-y">
          {notificationsQuery.isLoading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 w-full animate-pulse rounded bg-muted"
                />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                compact={true}
                onNavigate={() => setOpen(false)}
              />
            ))
          )}
        </div>

        <div className="border-t p-2">
          <Link
            href="/employee/notifications"
            onClick={() => setOpen(false)}
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "w-full text-xs text-primary font-medium justify-center",
            })}
          >
            View all notifications in inbox
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

