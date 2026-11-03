import type { NotificationType } from "@/features/notifications/types/notification-types";

export function resolveNotificationTarget(
  type: NotificationType,
): string | null {
  switch (type) {
    case "HOLIDAY_ANNOUNCEMENT":
      return "/employee/holidays";
    case "LEAVE_APPROVED":
    case "LEAVE_REJECTED":
      return "/employee/leaves";
    default:
      return null;
  }
}

export function getNotificationTypeLabel(type: NotificationType): string {
  switch (type) {
    case "HOLIDAY_ANNOUNCEMENT":
      return "Holiday";
    case "LEAVE_APPROVED":
      return "Leave Approved";
    case "LEAVE_REJECTED":
      return "Leave Rejected";
    default:
      return "Notification";
  }
}

export function formatNotificationTime(instantIso?: string | null): string {
  if (!instantIso) return "—";
  try {
    const date = new Date(instantIso);
    if (Number.isNaN(date.getTime())) return "—";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "—";
  }
}

