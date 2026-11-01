import type { EmployeeListParams } from "@/features/employees/types/employee-types";

export const employeeKeys = {
  all: ["employees"] as const,
  lists: () => [...employeeKeys.all, "list"] as const,
  list: (params: EmployeeListParams) => [...employeeKeys.lists(), params] as const,
  details: () => [...employeeKeys.all, "detail"] as const,
  detail: (employeeId: string) => [...employeeKeys.details(), employeeId] as const,
  self: () => [...employeeKeys.all, "self"] as const,
  references: () => [...employeeKeys.all, "references"] as const,
  managers: () => [...employeeKeys.references(), "managers"] as const,
  options: () => [...employeeKeys.references(), "options"] as const,
};
