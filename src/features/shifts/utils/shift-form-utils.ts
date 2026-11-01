import type { ShiftFormValues } from "@/features/shifts/schemas/shift-schemas";
import type {
  CreateShiftRequest,
  DayOfWeek,
  Shift,
  UpdateShiftRequest,
} from "@/features/shifts/types/shift-types";
import {
  DEFAULT_WORKING_DAYS,
  normalizeTimeInput,
} from "@/features/shifts/utils/time-utils";

const optional = (value: string) => value.trim() || undefined;

export const emptyShiftFormValues: ShiftFormValues = {
  shiftCode: "",
  name: "",
  description: "",
  startTime: "09:00",
  endTime: "17:00",
  workingDays: [...DEFAULT_WORKING_DAYS],
  gracePeriodMinutes: "15",
  earlyDepartureGraceMinutes: "15",
  expectedBreakMinutes: "60",
  minimumBreakMinutes: "",
  flexible: false,
};

export function shiftToFormValues(shift: Shift): ShiftFormValues {
  return {
    shiftCode: shift.shiftCode,
    name: shift.name,
    description: shift.description ?? "",
    startTime: normalizeTimeInput(shift.startTime),
    endTime: normalizeTimeInput(shift.endTime),
    workingDays: [...shift.workingDays],
    gracePeriodMinutes: String(shift.gracePeriodMinutes),
    earlyDepartureGraceMinutes: String(shift.earlyDepartureGraceMinutes),
    expectedBreakMinutes: String(shift.expectedBreakMinutes),
    minimumBreakMinutes:
      shift.minimumBreakMinutes !== undefined &&
      shift.minimumBreakMinutes !== null
        ? String(shift.minimumBreakMinutes)
        : "",
    flexible: Boolean(shift.flexible),
  };
}

export function toCreateShiftRequest(
  values: ShiftFormValues,
): CreateShiftRequest {
  const minBreak = values.minimumBreakMinutes.trim();

  return {
    shiftCode: values.shiftCode.trim().toUpperCase(),
    name: values.name.trim(),
    description: optional(values.description),
    startTime: values.startTime.trim(),
    endTime: values.endTime.trim(),
    workingDays: values.workingDays,
    gracePeriodMinutes: Number(values.gracePeriodMinutes),
    earlyDepartureGraceMinutes: Number(values.earlyDepartureGraceMinutes),
    expectedBreakMinutes: Number(values.expectedBreakMinutes),
    minimumBreakMinutes: minBreak ? Number(minBreak) : undefined,
    flexible: Boolean(values.flexible),
  };
}

function areWorkingDaysEqual(a: DayOfWeek[], b: DayOfWeek[]): boolean {
  if (a.length !== b.length) return false;
  const setB = new Set(b);
  return a.every((day) => setB.has(day));
}

export function toUpdateShiftRequest(
  values: ShiftFormValues,
  shift: Shift,
): UpdateShiftRequest {
  const request: UpdateShiftRequest = {};

  const code = values.shiftCode.trim().toUpperCase();
  const name = values.name.trim();
  const description = values.description.trim();
  const start = values.startTime.trim();
  const end = values.endTime.trim();

  if (code !== shift.shiftCode) {
    request.shiftCode = code;
  }
  if (name !== shift.name) {
    request.name = name;
  }
  if (description !== (shift.description ?? "")) {
    request.description = description;
  }
  if (start !== normalizeTimeInput(shift.startTime)) {
    request.startTime = start;
  }
  if (end !== normalizeTimeInput(shift.endTime)) {
    request.endTime = end;
  }
  if (!areWorkingDaysEqual(values.workingDays, shift.workingDays)) {
    request.workingDays = values.workingDays;
  }

  const grace = Number(values.gracePeriodMinutes);
  if (grace !== shift.gracePeriodMinutes) {
    request.gracePeriodMinutes = grace;
  }

  const early = Number(values.earlyDepartureGraceMinutes);
  if (early !== shift.earlyDepartureGraceMinutes) {
    request.earlyDepartureGraceMinutes = early;
  }

  const expBreak = Number(values.expectedBreakMinutes);
  if (expBreak !== shift.expectedBreakMinutes) {
    request.expectedBreakMinutes = expBreak;
  }

  const minBreakStr = values.minimumBreakMinutes.trim();
  const minBreak = minBreakStr ? Number(minBreakStr) : undefined;
  if (minBreak !== (shift.minimumBreakMinutes ?? undefined)) {
    request.minimumBreakMinutes = minBreak;
  }

  if (values.flexible !== shift.flexible) {
    request.flexible = values.flexible;
  }

  return request;
}

