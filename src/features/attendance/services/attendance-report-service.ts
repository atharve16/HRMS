import type { ApiResponse } from "@/services/api-contract";
import { apiClient } from "@/services/api-client";
import type {
  AttendanceMonthlyReport,
  AttendanceMonthlyReportParams,
} from "@/features/attendance/types/attendance-report-types";

export async function getAttendanceMonthlyReport(
  params: AttendanceMonthlyReportParams,
): Promise<AttendanceMonthlyReport> {
  const response = await apiClient.get<ApiResponse<AttendanceMonthlyReport>>(
    "/admin/attendance/reports/monthly",
    { params },
  );
  return response.data.data;
}
