import type { AttendanceMonthlyReportParams } from "@/features/attendance/types/attendance-report-types";

export const attendanceReportKeys = {
  all: ["attendance", "reports"] as const,
  monthly: (params: AttendanceMonthlyReportParams) =>
    [...attendanceReportKeys.all, "monthly", params] as const,
};
