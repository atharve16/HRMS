import type {
  AdminAttendanceParams,
  AttendanceHistoryParams,
  AttendanceSummaryParams,
} from "@/features/attendance/types/attendance-types";

export const attendanceKeys = {
  all: ["attendance"] as const,
  me: () => [...attendanceKeys.all, "me"] as const,
  myToday: (date: string) => [...attendanceKeys.me(), "today", date] as const,
  myStatus: () => [...attendanceKeys.me(), "status"] as const,
  myHistories: () => [...attendanceKeys.me(), "history"] as const,
  myHistory: (params?: AttendanceHistoryParams) =>
    [...attendanceKeys.myHistories(), params] as const,
  admin: () => [...attendanceKeys.all, "admin"] as const,
  adminLists: () => [...attendanceKeys.admin(), "list"] as const,
  adminList: (params?: AdminAttendanceParams) =>
    [...attendanceKeys.adminLists(), params] as const,
  adminSummaries: () => [...attendanceKeys.admin(), "summary"] as const,
  adminSummary: (params?: AttendanceSummaryParams) =>
    [...attendanceKeys.adminSummaries(), params] as const,
  details: () => [...attendanceKeys.all, "detail"] as const,
  detail: (id: string) => [...attendanceKeys.details(), id] as const,
  employeeHistories: () => [...attendanceKeys.admin(), "employee"] as const,
  employeeHistory: (employeeId: string, params?: AttendanceHistoryParams) =>
    [...attendanceKeys.employeeHistories(), employeeId, params] as const,
};

