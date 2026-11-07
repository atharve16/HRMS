import { describe, expect, it } from "vitest";

import {
  COMPANY_TIMEZONE,
  formatDateShort,
  formatDayOfWeek,
  formatHoursMinutes,
  formatTimeShort,
  getCompanyTodayDate,
} from "./dashboard-time";

describe("dashboard-time utilities", () => {
  it("exports COMPANY_TIMEZONE as Asia/Kolkata", () => {
    expect(COMPANY_TIMEZONE).toBe("Asia/Kolkata");
  });

  it("getCompanyTodayDate returns YYYY-MM-DD format", () => {
    const today = getCompanyTodayDate();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("formatTimeShort formats ISO instants accurately in Asia/Kolkata", () => {
    // 03:30:00 UTC = 09:00:00 IST (+5:30)
    const formatted = formatTimeShort("2026-11-07T03:30:00Z");
    expect(formatted).toBe("9:00 AM");

    // Invalid or null returns dash
    expect(formatTimeShort(null)).toBe("—");
    expect(formatTimeShort("invalid")).toBe("—");
  });

  it("formatDateShort formats YYYY-MM-DD and ISO strings properly", () => {
    expect(formatDateShort("2026-11-07")).toBe("Nov 7, 2026");
    expect(formatDateShort(null)).toBe("—");
  });

  it("formatDayOfWeek extracts full weekday name", () => {
    // 2026-11-02 was a Monday
    expect(formatDayOfWeek("2026-11-02")).toBe("Monday");
    expect(formatDayOfWeek(null)).toBe("—");
  });

  it("formatHoursMinutes converts minutes to human readable durations", () => {
    expect(formatHoursMinutes(402)).toBe("6h 42m");
    expect(formatHoursMinutes(480)).toBe("8h");
    expect(formatHoursMinutes(45)).toBe("45m");
    expect(formatHoursMinutes(0)).toBe("0m");
    expect(formatHoursMinutes(-10)).toBe("0m");
    expect(formatHoursMinutes(null)).toBe("0m");
  });
});

