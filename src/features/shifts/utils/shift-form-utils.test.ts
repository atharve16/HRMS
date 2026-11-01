import { describe, expect, it } from "vitest";

import type { DayOfWeek, Shift } from "@/features/shifts/types/shift-types";
import {
  emptyShiftFormValues,
  shiftToFormValues,
  toCreateShiftRequest,
  toUpdateShiftRequest,
} from "@/features/shifts/utils/shift-form-utils";

const mockShift: Shift = {
  id: "shift-123",
  shiftCode: "DAY-01",
  name: "General Day Shift",
  description: "Standard morning shift",
  startTime: "09:00:00",
  endTime: "17:00:00",
  workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  gracePeriodMinutes: 15,
  earlyDepartureGraceMinutes: 10,
  expectedBreakMinutes: 60,
  minimumBreakMinutes: 30,
  flexible: false,
  status: "ACTIVE",
  createdAt: "2026-11-01T00:00:00Z",
  updatedAt: "2026-11-01T00:00:00Z",
};

describe("shift form utils", () => {
  it("provides sensible defaults in emptyShiftFormValues", () => {
    expect(emptyShiftFormValues.shiftCode).toBe("");
    expect(emptyShiftFormValues.startTime).toBe("09:00");
    expect(emptyShiftFormValues.endTime).toBe("17:00");
    expect(emptyShiftFormValues.workingDays).toEqual([
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
    ]);
    expect(emptyShiftFormValues.flexible).toBe(false);
  });

  it("converts a Shift entity to form values with normalized time strings", () => {
    const formValues = shiftToFormValues(mockShift);
    expect(formValues).toEqual({
      shiftCode: "DAY-01",
      name: "General Day Shift",
      description: "Standard morning shift",
      startTime: "09:00",
      endTime: "17:00",
      workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
      gracePeriodMinutes: "15",
      earlyDepartureGraceMinutes: "10",
      expectedBreakMinutes: "60",
      minimumBreakMinutes: "30",
      flexible: false,
    });
  });

  it("transforms form values to CreateShiftRequest with uppercased code and numeric types", () => {
    const formValues = {
      shiftCode: "night-01  ",
      name: "  Night Shift  ",
      description: "  Overnight operations  ",
      startTime: " 22:00 ",
      endTime: " 06:00 ",
      workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY"] as DayOfWeek[],
      gracePeriodMinutes: " 20 ",
      earlyDepartureGraceMinutes: " 15 ",
      expectedBreakMinutes: " 45 ",
      minimumBreakMinutes: " 30 ",
      flexible: true,
    };

    const request = toCreateShiftRequest(formValues);
    expect(request).toEqual({
      shiftCode: "NIGHT-01",
      name: "Night Shift",
      description: "Overnight operations",
      startTime: "22:00",
      endTime: "06:00",
      workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY"],
      gracePeriodMinutes: 20,
      earlyDepartureGraceMinutes: 15,
      expectedBreakMinutes: 45,
      minimumBreakMinutes: 30,
      flexible: true,
    });
  });

  it("builds a partial update request with only changed fields", () => {
    const formValues = shiftToFormValues(mockShift);

    // No changes
    expect(toUpdateShiftRequest(formValues, mockShift)).toEqual({});

    // Change times and flexible flag only
    const updatedValues = {
      ...formValues,
      startTime: "10:00",
      flexible: true,
    };

    const patchRequest = toUpdateShiftRequest(updatedValues, mockShift);
    expect(patchRequest).toEqual({
      startTime: "10:00",
      flexible: true,
    });
    expect(patchRequest.shiftCode).toBeUndefined();
    expect(patchRequest.name).toBeUndefined();
    expect(patchRequest.workingDays).toBeUndefined();
  });
});
