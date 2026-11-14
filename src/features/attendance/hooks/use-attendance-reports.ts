"use client";

import { useQuery } from "@tanstack/react-query";

import { getAttendanceMonthlyReport } from "@/features/attendance/services/attendance-report-service";
import type { AttendanceMonthlyReportParams } from "@/features/attendance/types/attendance-report-types";

export const attendanceReportKeys = {
  all: ["attendance", "reports"] as const,
  monthly: (params: AttendanceMonthlyReportParams) =>
    [...attendanceReportKeys.all, "monthly", params] as const,
};

export function useAttendanceMonthlyReport(params: AttendanceMonthlyReportParams) {
  return useQuery({
    queryKey: attendanceReportKeys.monthly(params),
    queryFn: () => getAttendanceMonthlyReport(params),
    enabled: Boolean(params.month),
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });
}
