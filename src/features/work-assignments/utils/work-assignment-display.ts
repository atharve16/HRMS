import type {
  AssignmentStatus,
  WorkAssignment,
} from "@/features/work-assignments/types/work-assignment-types";

export function formatAssignmentDate(
  dateString?: string | null,
  fallback = "Indefinite",
): string {
  if (!dateString) return fallback;
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return dateString;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatEffectiveRange(
  effectiveFrom: string,
  effectiveTo?: string | null,
): string {
  const from = formatAssignmentDate(effectiveFrom, "Unknown");
  const to = effectiveTo ? formatAssignmentDate(effectiveTo) : "Present";
  return `${from} – ${to}`;
}

export function sortAssignmentsChronological(
  assignments: WorkAssignment[],
): WorkAssignment[] {
  return [...assignments].sort((a, b) => {
    const diff = b.effectiveFrom.localeCompare(a.effectiveFrom);
    if (diff !== 0) return diff;
    return (b.createdAt || "").localeCompare(a.createdAt || "");
  });
}

export function isAssignmentCurrentlyActive(
  assignment: WorkAssignment,
  referenceDate = new Date().toISOString().slice(0, 10),
): boolean {
  if (assignment.status !== "ACTIVE") return false;
  if (assignment.effectiveFrom > referenceDate) return false;
  if (assignment.effectiveTo && assignment.effectiveTo < referenceDate) return false;
  return true;
}

export const assignmentStatusLabels: Record<AssignmentStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

