"use client";

import { Check, CheckCircle2, PartyPopper, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMarkNotificationRead } from "@/features/notifications/hooks/use-notifications";
import type { NotificationResponse } from "@/features/notifications/types/notification-types";
import {
  formatNotificationTime,
  getNotificationTypeLabel,
  resolveNotificationTarget,
} from "@/features/notifications/utils/notification-display";

export function NotificationItem({
  notification,
  compact = false,
  onRead,
  onNavigate,
}: {
  notification: NotificationResponse;
  compact?: boolean;
  onRead?: () => void;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const markReadMutation = useMarkNotificationRead();

  const targetUrl = resolveNotificationTarget(notification.type);

  const handleMarkRead = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!notification.isRead && !markReadMutation.isPending) {
      await markReadMutation.mutateAsync(notification.id);
      onRead?.();
    }
  };

  const handleClick = async () => {
    if (!notification.isRead) {
      void handleMarkRead();
    }
    if (targetUrl) {
      onNavigate?.();
      router.push(targetUrl);
    }
  };

  const getIcon = () => {
    switch (notification.type) {
      case "HOLIDAY_ANNOUNCEMENT":
        return <PartyPopper className="size-4 text-info" />;
      case "LEAVE_APPROVED":
        return <CheckCircle2 className="size-4 text-success" />;
      case "LEAVE_REJECTED":
        return <XCircle className="size-4 text-destructive" />;
    }
  };

  const getTypeVariant = () => {
    switch (notification.type) {
      case "HOLIDAY_ANNOUNCEMENT":
        return "info" as const;
      case "LEAVE_APPROVED":
        return "success" as const;
      case "LEAVE_REJECTED":
        return "destructive" as const;
    }
  };

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className={`group relative flex cursor-pointer items-start gap-3 p-3 transition-colors hover:bg-muted/60 ${
          notification.isRead ? "opacity-75" : "bg-primary-soft/10"
        }`}
      >
        <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-card border">
          {getIcon()}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-1">
            <p
              className={`text-xs text-foreground truncate ${
                notification.isRead ? "font-medium" : "font-semibold"
              }`}
            >
              {notification.title}
            </p>
            <span className="text-[10px] text-muted-foreground shrink-0">
              {formatNotificationTime(notification.createdAt)}
            </span>
          </div>

          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
            {notification.message}
          </p>
        </div>

        {!notification.isRead && (
          <span
            className="size-2 shrink-0 self-center rounded-full bg-primary"
            aria-label="Unread"
          />
        )}
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`group relative flex items-start justify-between gap-4 rounded-xl border p-4 transition-all ${
        targetUrl ? "cursor-pointer hover:border-primary/40 hover:shadow-xs" : ""
      } ${notification.isRead ? "bg-card" : "bg-primary-soft/10 border-primary/20"}`}
    >
      <div className="flex items-start gap-3.5 min-w-0">
        <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-card border shadow-xs">
          {getIcon()}
        </span>

        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              className={`text-sm text-foreground ${
                notification.isRead ? "font-medium" : "font-bold"
              }`}
            >
              {notification.title}
            </h4>
            <Badge variant={getTypeVariant()} className="text-[10px]">
              {getNotificationTypeLabel(notification.type)}
            </Badge>
            {!notification.isRead && (
              <span className="size-2 rounded-full bg-primary" />
            )}
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            {notification.message}
          </p>

          <div className="flex items-center gap-3 pt-1 text-[11px] text-muted-foreground">
            <span>{formatNotificationTime(notification.createdAt)}</span>
            {targetUrl && (
              <span className="text-primary hover:underline">
                View related details →
              </span>
            )}
          </div>
        </div>
      </div>

      {!notification.isRead && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
          onClick={handleMarkRead}
          disabled={markReadMutation.isPending}
          title="Mark as read"
        >
          <Check className="mr-1 size-3.5" />
          Mark read
        </Button>
      )}
    </div>
  );
}

