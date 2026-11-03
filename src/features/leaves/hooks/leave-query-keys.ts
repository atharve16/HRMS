import type {
  EmployeeLeaveParams,
  LeaveSearchParams,
} from "@/features/leaves/types/leave-types";

export const leaveKeys = {
  all: ["leaves"] as const,
  me: () => [...leaveKeys.all, "me"] as const,
  myLists: () => [...leaveKeys.me(), "list"] as const,
  myList: (params?: EmployeeLeaveParams) =>
    [...leaveKeys.myLists(), params] as const,
  myBalances: () => [...leaveKeys.me(), "balance"] as const,
  myBalance: (year?: number) => [...leaveKeys.myBalances(), year] as const,
  admin: () => [...leaveKeys.all, "admin"] as const,
  adminLists: () => [...leaveKeys.admin(), "list"] as const,
  adminList: (params?: LeaveSearchParams) =>
    [...leaveKeys.adminLists(), params] as const,
  details: () => [...leaveKeys.all, "detail"] as const,
  detail: (leaveId: string) => [...leaveKeys.details(), leaveId] as const,
  employeeBalances: () => [...leaveKeys.admin(), "employee-balance"] as const,
  employeeBalance: (employeeId: string, year?: number) =>
    [...leaveKeys.employeeBalances(), employeeId, year] as const,
};

