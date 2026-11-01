import { describe, expect, it } from "vitest";

import { shiftFormSchema } from "@/features/shifts/schemas/shift-schemas";

const validShift = {
  shiftCode: "DAY-01",
  name: "General Day Shift",
  description: "Standard morning to evening shift",
  startTime: "09:00",
  endTime: "17:00",
  workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  gracePeriodMinutes: "15",
  earlyDepartureGraceMinutes: "15",
  expectedBreakMinutes: "60",
  minimumBreakMinutes: "30",
  flexible: false,
};

describe("shift form schema", () => {
  it("accepts valid daytime shifts", () => {
    const result = shiftFormSchema.safeParse(validShift);
    expect(result.success).toBe(true);
  });

  it("accepts valid overnight shifts where end time is earlier than start time", () => {
    const result = shiftFormSchema.safeParse({
      ...validShift,
      shiftCode: "NIGHT-01",
      name: "Overnight Shift",
      startTime: "22:00",
      endTime: "06:00",
    });
    expect(result.success).toBe(true);
  });

  it("validates shiftCode pattern and length", () => {
    expect(
      shiftFormSchema.safeParse({
        ...validShift,
        shiftCode: "A",
      }).success,
    ).toBe(false);

    expect(
      shiftFormSchema.safeParse({
        ...validShift,
        shiftCode: "INVALID CODE WITH SPACES",
      }).success,
    ).toBe(false);

    expect(
      shiftFormSchema.safeParse({
        ...validShift,
        shiftCode: "SHIFT_CODE-2026",
      }).success,
    ).toBe(true);
  });

  it("requires valid times and at least one working day", () => {
    expect(
      shiftFormSchema.safeParse({
        ...validShift,
        startTime: "25:00",
      }).success,
    ).toBe(false);

    expect(
      shiftFormSchema.safeParse({
        ...validShift,
        endTime: "bad-time",
      }).success,
    ).toBe(false);

    expect(
      shiftFormSchema.safeParse({
        ...validShift,
        workingDays: [],
      }).success,
    ).toBe(false);
  });

  it("enforces break constraints (minimumBreak <= expectedBreak)", () => {
    expect(
      shiftFormSchema.safeParse({
        ...validShift,
        expectedBreakMinutes: "30",
        minimumBreakMinutes: "45",
      }).success,
    ).toBe(false);

    expect(
      shiftFormSchema.safeParse({
        ...validShift,
        expectedBreakMinutes: "60",
        minimumBreakMinutes: "60",
      }).success,
    ).toBe(true);

    expect(
      shiftFormSchema.safeParse({
        ...validShift,
        minimumBreakMinutes: "",
      }).success,
    ).toBe(true);
  });

  it("enforces minutes range (0 to 1440)", () => {
    expect(
      shiftFormSchema.safeParse({
        ...validShift,
        gracePeriodMinutes: "-5",
      }).success,
    ).toBe(false);

    expect(
      shiftFormSchema.safeParse({
        ...validShift,
        gracePeriodMinutes: "1441",
      }).success,
    ).toBe(false);
  });
});

