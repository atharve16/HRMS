export function formatHolidayDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatHolidayMonthYear(dateStr?: string | null): string {
  if (!dateStr) return "—";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return dateStr;
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      year: "numeric",
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function formatHolidayDayNumber(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const [, , day] = dateStr.split("-");
    return day || "";
  } catch {
    return "";
  }
}

export function formatHolidayWeekday(dateStr?: string | null): string {
  if (!dateStr) return "";
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return "";
    const date = new Date(year, month - 1, day);
    return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(date);
  } catch {
    return "";
  }
}

export function groupHolidaysByMonth<T extends { date: string }>(
  holidays: T[],
): { monthYear: string; holidays: T[] }[] {
  const groups: Map<string, T[]> = new Map();

  for (const holiday of holidays) {
    const key = formatHolidayMonthYear(holiday.date);
    const existing = groups.get(key) || [];
    existing.push(holiday);
    groups.set(key, existing);
  }

  return Array.from(groups.entries()).map(([monthYear, items]) => ({
    monthYear,
    holidays: items,
  }));
}

export function isPastHoliday(dateStr: string): boolean {
  const today = new Date().toISOString().slice(0, 10);
  return dateStr < today;
}

