import type { DayOfWeek } from "@/features/shifts/types/shift-types";

export const ALL_DAYS_OF_WEEK: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
];

export const DEFAULT_WORKING_DAYS: DayOfWeek[] = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
];

export const dayOfWeekLabels: Record<DayOfWeek, { short: string; full: string }> = {
  MONDAY: { short: "Mon", full: "Monday" },
  TUESDAY: { short: "Tue", full: "Tuesday" },
  WEDNESDAY: { short: "Wed", full: "Wednesday" },
  THURSDAY: { short: "Thu", full: "Thursday" },
  FRIDAY: { short: "Fri", full: "Friday" },
  SATURDAY: { short: "Sat", full: "Saturday" },
  SUNDAY: { short: "Sun", full: "Sunday" },
};

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;

export function isValidTimeString(value: string): boolean {
  return typeof value === "string" && timeRegex.test(value.trim());
}

/**
 * Normalizes an API time string (e.g. "09:00:00" or "09:00") into "HH:mm" for <input type="time">.
 */
export function normalizeTimeInput(value?: string): string {
  if (!value) return "";
  const trimmed = value.trim();
  const parts = trimmed.split(":");
  if (parts.length >= 2) {
    const hours = parts[0].padStart(2, "0");
    const minutes = parts[1].padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  return trimmed;
}

/**
 * Converts "HH:mm" or "HH:mm:ss" to total minutes since midnight (0 - 1439).
 */
export function timeToMinutes(time: string): number {
  const parts = time.split(":");
  const hours = Number.parseInt(parts[0] || "0", 10);
  const minutes = Number.parseInt(parts[1] || "0", 10);
  return hours * 60 + minutes;
}

/**
 * Determines whether a shift is overnight (i.e. end time is strictly earlier than start time).
 */
export function isOvernightShift(startTime: string, endTime: string): boolean {
  if (!isValidTimeString(startTime) || !isValidTimeString(endTime)) {
    return false;
  }
  return timeToMinutes(endTime) < timeToMinutes(startTime);
}

/**
 * Calculates total gross scheduled minutes of a shift.
 * If overnight, spans past midnight to the following calendar day.
 */
export function calculateShiftDurationMinutes(
  startTime: string,
  endTime: string,
): number {
  if (!isValidTimeString(startTime) || !isValidTimeString(endTime)) {
    return 0;
  }
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  if (end < start) {
    return 24 * 60 - start + end;
  }
  if (end === start) {
    return 24 * 60; // 24-hour shift
  }
  return end - start;
}

/**
 * Formats a duration in minutes into a human-readable string (e.g. "8h 0m" or "45m").
 */
export function formatMinutesDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

/**
 * Formats an ISO LocalTime ("HH:mm" or "HH:mm:ss") into standard 12-hour AM/PM format (e.g. "9:00 AM").
 */
export function formatTimeDisplay(time?: string): string {
  if (!time || !isValidTimeString(time)) return "Not set";
  const [hStr, mStr] = time.split(":");
  const hours = Number.parseInt(hStr, 10);
  const minutes = Number.parseInt(mStr, 10);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 === 0 ? 12 : hours % 12;
  const displayMinutes = String(minutes).padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${period}`;
}

/**
 * Formats a start and end time range with overnight indicator.
 * e.g. "9:00 AM – 5:00 PM" or "10:00 PM – 6:00 AM (+1 day)"
 */
export function formatShiftTimeRange(
  startTime: string,
  endTime: string,
): string {
  const start = formatTimeDisplay(startTime);
  const end = formatTimeDisplay(endTime);
  const overnight = isOvernightShift(startTime, endTime);
  return overnight ? `${start} – ${end} (+1 day)` : `${start} – ${end}`;
}

/**
 * Generates a clean human-readable summary of working days.
 */
export function formatWorkingDaysSummary(days: DayOfWeek[]): string {
  if (!days || days.length === 0) return "No days scheduled";
  if (days.length === 7) return "Every day (7 days)";

  // Check for Monday-Friday standard workweek
  const standardFive = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"];
  if (
    days.length === 5 &&
    standardFive.every((d) => days.includes(d as DayOfWeek))
  ) {
    return "Monday – Friday (5 days)";
  }

  // Preserve standard weekly order
  const sorted = ALL_DAYS_OF_WEEK.filter((d) => days.includes(d));
  return sorted.map((d) => dayOfWeekLabels[d].short).join(", ");
}

