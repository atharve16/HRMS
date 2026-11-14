"use client";

import { useQuery } from "@tanstack/react-query";

import { attendanceReportKeys } from "@/features/attendance/hooks/attendance-report-query-keys";
import { getAttendanceMonthlyReport } from "@/features/attendance/services/attendance-report-service";
import type { AttendanceMonthlyReportParams } from "@/features/attendance/types/attendance-report-types";

export function useAttendanceMonthlyReport(params: AttendanceMonthlyReportParams) {
  return useQuery({
    queryKey: attendanceReportKeys.monthly(params),
    queryFn: () => getAttendanceMonthlyReport(params),
    enabled: Boolean(params.month),
    placeholderData: (previous) => previous,
  });
}
