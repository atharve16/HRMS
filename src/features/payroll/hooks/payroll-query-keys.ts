import type {
  AdminPayrollParams,
  EmployeePayrollParams,
} from "@/features/payroll/types/payroll-types";

export const payrollKeys = {
  all: ["payroll"] as const,
  admin: () => [...payrollKeys.all, "admin"] as const,
  adminLists: () => [...payrollKeys.admin(), "list"] as const,
  adminList: (params?: AdminPayrollParams) =>
    [...payrollKeys.adminLists(), params] as const,
  details: () => [...payrollKeys.all, "detail"] as const,
  detail: (id: string) => [...payrollKeys.details(), id] as const,
  employee: () => [...payrollKeys.all, "employee"] as const,
  employeeLists: () => [...payrollKeys.employee(), "list"] as const,
  employeeList: (params?: EmployeePayrollParams) =>
    [...payrollKeys.employeeLists(), params] as const,
  employeeDetails: () => [...payrollKeys.employee(), "detail"] as const,
  employeeDetail: (id: string) =>
    [...payrollKeys.employeeDetails(), id] as const,
  salaries: () => [...payrollKeys.all, "salary"] as const,
  salary: (employeeId: string) =>
    [...payrollKeys.salaries(), employeeId] as const,
  salaryHistory: (employeeId: string) =>
    [...payrollKeys.salaries(), employeeId, "history"] as const,
};

