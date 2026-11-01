import type { DepartmentStatus } from "@/features/departments/types/department-types";

export const departmentStatusLabels: Record<DepartmentStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
};

export function formatDepartmentTimestamp(value?: string) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
