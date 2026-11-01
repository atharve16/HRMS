import type { ShiftStatus } from "@/features/shifts/types/shift-types";

export const shiftStatusLabels: Record<ShiftStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export function formatShiftTimestamp(value?: string) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

