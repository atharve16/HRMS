import { describe, expect, it } from "vitest";

import {
  formatHolidayDate,
  formatHolidayMonthYear,
  formatHolidayWeekday,
  groupHolidaysByMonth,
} from "@/features/holidays/utils/holiday-display";

describe("holiday-display", () => {
  it("formats date with day of week and month", () => {
    const formatted = formatHolidayDate("2026-08-15");
    expect(formatted).toContain("Aug 15, 2026");
    expect(formatted).toContain("Sat");
  });

  it("formats month and year", () => {
    expect(formatHolidayMonthYear("2026-08-15")).toBe("August 2026");
  });

  it("formats full weekday", () => {
    expect(formatHolidayWeekday("2026-08-15")).toBe("Saturday");
  });

  it("groups holidays by month and year", () => {
    const list = [
      { id: "1", name: "Holiday 1", date: "2026-01-01" },
      { id: "2", name: "Holiday 2", date: "2026-01-26" },
      { id: "3", name: "Holiday 3", date: "2026-03-08" },
    ];
    const grouped = groupHolidaysByMonth(list);
    expect(grouped).toHaveLength(2);
    expect(grouped[0]?.monthYear).toBe("January 2026");
    expect(grouped[0]?.holidays).toHaveLength(2);
    expect(grouped[1]?.monthYear).toBe("March 2026");
    expect(grouped[1]?.holidays).toHaveLength(1);
  });
});

