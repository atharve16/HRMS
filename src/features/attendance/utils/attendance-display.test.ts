import { describe, expect, it } from "vitest";

import {
  formatAttendanceDate,
  formatAttendanceDateTime,
  formatAttendanceTime,
  formatDistanceMeters,
  formatDurationMinutes,
  formatGpsAccuracy,
} from "@/features/attendance/utils/attendance-display";

describe("attendance display formatting", () => {
  it("formats dates and date-times accurately in Asia/Kolkata timezone", () => {
    // 2026-11-02T03:30:00Z is 09:00 AM IST (UTC+5:30)
    const timeStr = formatAttendanceTime("2026-11-02T03:30:00Z");
    expect(timeStr).toBe("9:00 AM");

    const dateTimeStr = formatAttendanceDateTime("2026-11-02T03:30:00Z");
    expect(dateTimeStr).toContain("Nov 2, 2026");
    expect(dateTimeStr).toContain("9:00 AM");

    expect(formatAttendanceDate("2026-11-02")).toBe("Nov 2, 2026");
    expect(formatAttendanceDate(null)).toBe("—");
    expect(formatAttendanceTime(null)).toBe("—");
  });

  it("formats worked minutes durations", () => {
    expect(formatDurationMinutes(480)).toBe("8h");
    expect(formatDurationMinutes(515)).toBe("8h 35m");
    expect(formatDurationMinutes(45)).toBe("45m");
    expect(formatDurationMinutes(0)).toBe("0m");
    expect(formatDurationMinutes(-10)).toBe("0m");
  });

  it("formats distance and accuracy values", () => {
    expect(formatDistanceMeters(25.4)).toBe("25m");
    expect(formatDistanceMeters(1500)).toBe("1.5 km");
    expect(formatGpsAccuracy(8.2)).toBe("±8m");
  });
});

