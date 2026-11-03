import type {
  EmployeeHolidayParams,
  HolidaySearchParams,
} from "@/features/holidays/types/holiday-types";

export const holidayKeys = {
  all: ["holidays"] as const,
  admin: () => [...holidayKeys.all, "admin"] as const,
  adminLists: () => [...holidayKeys.admin(), "list"] as const,
  adminList: (params?: HolidaySearchParams) =>
    [...holidayKeys.adminLists(), params] as const,
  details: () => [...holidayKeys.all, "detail"] as const,
  detail: (id: string) => [...holidayKeys.details(), id] as const,
  employee: () => [...holidayKeys.all, "employee"] as const,
  employeeLists: () => [...holidayKeys.employee(), "list"] as const,
  employeeList: (params?: EmployeeHolidayParams) =>
    [...holidayKeys.employeeLists(), params] as const,
  employeeUpcoming: () => [...holidayKeys.employee(), "upcoming"] as const,
};

