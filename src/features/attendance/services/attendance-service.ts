import type {
  AdminAttendanceParams,
  AttendanceCorrectionRequest,
  AttendanceHistoryParams,
  AttendancePageResponse,
  AttendanceResponse,
  AttendanceStatusResponse,
  AttendanceSummaryParams,
  AttendanceSummaryResponse,
  GpsRequest,
  AttendanceCorrectionResponse,
  SubmitAttendanceCorrectionRequest,
  ReviewAttendanceCorrectionRequest,
  AttendanceCorrectionStatus,
  AttendanceCorrectionPageResponse,
} from "@/features/attendance/types/attendance-types";
import type { ApiResponse } from "@/services/api-contract";
import { apiClient } from "@/services/api-client";

export async function checkIn(
  request: GpsRequest,
): Promise<AttendanceResponse> {
  const response = await apiClient.post<ApiResponse<AttendanceResponse>>(
    "/attendance/check-in",
    request,
  );
  return response.data.data;
}

export async function checkOut(
  request: GpsRequest,
): Promise<AttendanceResponse> {
  const response = await apiClient.post<ApiResponse<AttendanceResponse>>(
    "/attendance/check-out",
    request,
  );
  return response.data.data;
}

export async function getMyAttendance(
  date: string,
): Promise<AttendanceResponse | null> {
  const response = await apiClient.get<ApiResponse<AttendanceResponse | null>>(
    "/attendance/me",
    { params: { date } },
  );
  return response.data.data;
}

export async function getMyAttendanceHistory(
  params?: AttendanceHistoryParams,
): Promise<AttendancePageResponse> {
  const response = await apiClient.get<ApiResponse<AttendancePageResponse>>(
    "/attendance/me/history",
    { params },
  );
  return response.data.data;
}

export async function getMyAttendanceStatus(): Promise<AttendanceStatusResponse> {
  const response = await apiClient.get<ApiResponse<AttendanceStatusResponse>>(
    "/attendance/me/status",
  );
  return response.data.data;
}

export async function listAdminAttendance(
  params?: AdminAttendanceParams,
): Promise<AttendancePageResponse> {
  const response = await apiClient.get<ApiResponse<AttendancePageResponse>>(
    "/admin/attendance",
    { params },
  );
  return response.data.data;
}

export async function getAdminAttendanceSummary(
  params?: AttendanceSummaryParams,
): Promise<AttendanceSummaryResponse> {
  const response = await apiClient.get<ApiResponse<AttendanceSummaryResponse>>(
    "/admin/attendance/summary",
    { params },
  );
  return response.data.data;
}

export async function getAttendanceDetail(
  attendanceId: string,
): Promise<AttendanceResponse> {
  const response = await apiClient.get<ApiResponse<AttendanceResponse>>(
    `/admin/attendance/${attendanceId}`,
  );
  return response.data.data;
}

export async function correctAttendance(
  attendanceId: string,
  request: AttendanceCorrectionRequest,
): Promise<AttendanceResponse> {
  const response = await apiClient.patch<ApiResponse<AttendanceResponse>>(
    `/admin/attendance/${attendanceId}/correction`,
    request,
  );
  return response.data.data;
}

export async function getEmployeeAttendanceHistory(
  employeeId: string,
  params?: AttendanceHistoryParams,
): Promise<AttendancePageResponse> {
  const response = await apiClient.get<ApiResponse<AttendancePageResponse>>(
    `/admin/employees/${employeeId}/attendance`,
    { params },
  );
  return response.data.data;
}

export async function submitAttendanceCorrection(request: SubmitAttendanceCorrectionRequest) {
  const response = await apiClient.post<ApiResponse<AttendanceCorrectionResponse>>("/attendance/correction-requests", request);
  return response.data.data;
}

export async function getMyAttendanceCorrections() {
  const response = await apiClient.get<ApiResponse<AttendanceCorrectionResponse[]>>("/attendance/correction-requests/my");
  return response.data.data;
}

export async function cancelAttendanceCorrection(id: string) {
  const response = await apiClient.post<ApiResponse<AttendanceCorrectionResponse>>(`/attendance/correction-requests/${encodeURIComponent(id)}/cancel`);
  return response.data.data;
}

export async function listAdminAttendanceCorrections(params?: { employeeId?: string; departmentId?: string; fromDate?: string; toDate?: string; status?: AttendanceCorrectionStatus; page?: number; limit?: number }) {
  const response = await apiClient.get<ApiResponse<AttendanceCorrectionPageResponse>>("/admin/attendance/correction-requests", { params });
  return response.data.data;
}

export async function approveAttendanceCorrection(id: string, request?: ReviewAttendanceCorrectionRequest) {
  const response = await apiClient.post<ApiResponse<AttendanceCorrectionResponse>>(`/admin/attendance/correction-requests/${encodeURIComponent(id)}/approve`, request ?? {});
  return response.data.data;
}

export async function rejectAttendanceCorrection(id: string, request?: ReviewAttendanceCorrectionRequest) {
  const response = await apiClient.post<ApiResponse<AttendanceCorrectionResponse>>(`/admin/attendance/correction-requests/${encodeURIComponent(id)}/reject`, request ?? {});
  return response.data.data;
}

