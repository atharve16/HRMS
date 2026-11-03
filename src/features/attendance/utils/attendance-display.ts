import type {
  AttendanceStatus,
  SessionStatus,
} from "@/features/attendance/types/attendance-types";

export const COMPANY_TIMEZONE = "Asia/Kolkata";

export function formatAttendanceTime(
  instantIso?: string | null,
  timeZone = COMPANY_TIMEZONE,
): string {
  if (!instantIso) return "—";
  try {
    const date = new Date(instantIso);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone,
    }).format(date);
  } catch {
    return "—";
  }
}

export function formatAttendanceDateTime(
  instantIso?: string | null,
  timeZone = COMPANY_TIMEZONE,
): string {
  if (!instantIso) return "—";
  try {
    const date = new Date(instantIso);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone,
    }).format(date);
  } catch {
    return "—";
  }
}

export function formatAttendanceDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const [year, month, day] = dateStr.split("-").map(Number);
  if (!year || !month || !day) return dateStr;
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDurationMinutes(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const remainingMins = Math.round(minutes % 60);
  if (hours > 0 && remainingMins > 0) return `${hours}h ${remainingMins}m`;
  if (hours > 0) return `${hours}h`;
  return `${remainingMins}m`;
}

export function formatDistanceMeters(distanceMeters: number): string {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) return "0m";
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)} km`;
  }
  return `${Math.round(distanceMeters)}m`;
}

export function formatGpsAccuracy(accuracyMeters: number): string {
  if (!Number.isFinite(accuracyMeters) || accuracyMeters < 0) return "Unknown";
  return `±${Math.round(accuracyMeters)}m`;
}

export const attendanceStatusConfig: Record<
  AttendanceStatus,
  {
    label: string;
    variant: "default" | "success" | "warning" | "destructive" | "info" | "neutral";
    description: string;
  }
> = {
  PRESENT: {
    label: "Present",
    variant: "success",
    description: "Full working hours completed successfully.",
  },
  PARTIAL: {
    label: "Partial",
    variant: "warning",
    description: "Completed sessions did not meet expected shift hours.",
  },
  INCOMPLETE: {
    label: "Incomplete",
    variant: "destructive",
    description: "Currently open session or missing checkout punch.",
  },
  ABSENT: {
    label: "Absent",
    variant: "destructive",
    description: "No attendance recorded for scheduled work day.",
  },
  HOLIDAY: {
    label: "Holiday",
    variant: "info",
    description: "Designated company or regional holiday.",
  },
  ON_LEAVE: {
    label: "On Leave",
    variant: "neutral",
    description: "Approved employee leave on this work date.",
  },
};

export const sessionStatusConfig: Record<
  SessionStatus,
  {
    label: string;
    variant: "default" | "success" | "warning" | "destructive" | "info" | "neutral";
  }
> = {
  OPEN: {
    label: "Open / Active",
    variant: "warning",
  },
  COMPLETED: {
    label: "Completed",
    variant: "neutral",
  },
};

