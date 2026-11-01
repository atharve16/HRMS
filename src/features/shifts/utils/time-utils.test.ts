import { describe, expect, it } from "vitest";

import {
  calculateShiftDurationMinutes,
  formatMinutesDuration,
  formatShiftTimeRange,
  formatTimeDisplay,
  formatWorkingDaysSummary,
  isOvernightShift,
  isValidTimeString,
  normalizeTimeInput,
  timeToMinutes,
} from "@/features/shifts/utils/time-utils";

describe("shift time utilities", () => {
  describe("validation and normalization", () => {
    it("validates time strings", () => {
      expect(isValidTimeString("09:00")).toBe(true);
      expect(isValidTimeString("09:00:00")).toBe(true);
      expect(isValidTimeString("23:59")).toBe(true);
      expect(isValidTimeString("00:00")).toBe(true);
      expect(isValidTimeString("24:00")).toBe(false);
      expect(isValidTimeString("9:00")).toBe(false);
      expect(isValidTimeString("invalid")).toBe(false);
    });

    it("normalizes API time strings to HH:mm for HTML time inputs", () => {
      expect(normalizeTimeInput("09:00:00")).toBe("09:00");
      expect(normalizeTimeInput("17:30:45")).toBe("17:30");
      expect(normalizeTimeInput("09:00")).toBe("09:00");
      expect(normalizeTimeInput("")).toBe("");
    });

    it("converts time to minutes since midnight", () => {
      expect(timeToMinutes("00:00")).toBe(0);
      expect(timeToMinutes("09:30")).toBe(570);
      expect(timeToMinutes("23:59")).toBe(1439);
    });
  });

  describe("overnight shifts and duration", () => {
    it("detects overnight shifts where end time is earlier than start time", () => {
      expect(isOvernightShift("22:00", "06:00")).toBe(true);
      expect(isOvernightShift("20:00", "04:30")).toBe(true);
      expect(isOvernightShift("09:00", "17:00")).toBe(false);
      expect(isOvernightShift("12:00", "12:00")).toBe(false);
    });

    it("calculates correct duration for daytime, overnight, and 24h shifts", () => {
      // Daytime 9:00 to 17:00 (8 hours = 480 mins)
      expect(calculateShiftDurationMinutes("09:00", "17:00")).toBe(480);

      // Overnight 22:00 to 06:00 (8 hours = 480 mins)
      expect(calculateShiftDurationMinutes("22:00", "06:00")).toBe(480);

      // Overnight 21:30 to 05:45 (8h 15m = 495 mins)
      expect(calculateShiftDurationMinutes("21:30", "05:45")).toBe(495);

      // 24 hour shift
      expect(calculateShiftDurationMinutes("08:00", "08:00")).toBe(1440);
    });

    it("formats duration minutes into readable strings", () => {
      expect(formatMinutesDuration(480)).toBe("8h");
      expect(formatMinutesDuration(510)).toBe("8h 30m");
      expect(formatMinutesDuration(45)).toBe("45m");
      expect(formatMinutesDuration(0)).toBe("0m");
    });
  });

  describe("formatting and working days display", () => {
    it("formats times in 12-hour AM/PM display", () => {
      expect(formatTimeDisplay("09:00:00")).toBe("9:00 AM");
      expect(formatTimeDisplay("12:00")).toBe("12:00 PM");
      expect(formatTimeDisplay("17:30:00")).toBe("5:30 PM");
      expect(formatTimeDisplay("00:00")).toBe("12:00 AM");
      expect(formatTimeDisplay("23:45")).toBe("11:45 PM");
    });

    it("formats time ranges with overnight indicators", () => {
      expect(formatShiftTimeRange("09:00", "17:00")).toBe("9:00 AM – 5:00 PM");
      expect(formatShiftTimeRange("22:00", "06:00")).toBe(
        "10:00 PM – 6:00 AM (+1 day)",
      );
    });

    it("formats working days summary", () => {
      expect(
        formatWorkingDaysSummary([
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
        ]),
      ).toBe("Monday – Friday (5 days)");

      expect(
        formatWorkingDaysSummary([
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
          "SUNDAY",
        ]),
      ).toBe("Every day (7 days)");

      expect(
        formatWorkingDaysSummary(["MONDAY", "WEDNESDAY", "FRIDAY"]),
      ).toBe("Mon, Wed, Fri");
    });
  });
});

