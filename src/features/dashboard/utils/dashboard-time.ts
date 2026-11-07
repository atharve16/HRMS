import { COMPANY_TIMEZONE } from "@/features/attendance/utils/attendance-display";

export { COMPANY_TIMEZONE };

/**
 * Returns today's calendar date in the company timezone (Asia/Kolkata) as YYYY-MM-DD.
 */
export function getCompanyTodayDate(timeZone = COMPANY_TIMEZONE): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date());
}

/**
 * Formats an ISO instant or date string into human-readable time (e.g. "9:04 AM")
 * in the company timezone.
 */
export function formatTimeShort(
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

/**
 * Formats a date string (YYYY-MM-DD or ISO) into "Nov 7, 2026" format.
 */
export function formatDateShort(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    if (dateStr.includes("T")) {
      const date = new Date(dateStr);
      if (Number.isNaN(date.getTime())) return "—";
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone: COMPANY_TIMEZONE,
      }).format(date);
    }

    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;
    const date = new Date(Date.UTC(year, month - 1, day));
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return dateStr;
  }
}

/**
 * Formats a date string into its day of the week (e.g. "Monday", "Friday").
 */
export function formatDayOfWeek(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return "—";
    const date = new Date(Date.UTC(year, month - 1, day));
    return new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      timeZone: "UTC",
    }).format(date);
  } catch {
    return "—";
  }
}

/**
 * Formats total minutes into hours and minutes string (e.g. "6h 42m", "0m").
 */
export function formatHoursMinutes(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`;
  }
  if (hours > 0) {
    return `${hours}h`;
  }
  return `${remainingMinutes}m`;
}

