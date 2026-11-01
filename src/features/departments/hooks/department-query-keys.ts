import type { DepartmentListParams } from "@/features/departments/types/department-types";

export const departmentKeys = {
  all: ["departments"] as const,
  lists: () => [...departmentKeys.all, "list"] as const,
  list: (params: DepartmentListParams) => [...departmentKeys.lists(), params] as const,
  details: () => [...departmentKeys.all, "detail"] as const,
  detail: (departmentId: string) => [...departmentKeys.details(), departmentId] as const,
  options: () => [...departmentKeys.all, "options"] as const,
};
