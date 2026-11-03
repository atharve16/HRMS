import type {
  AdminHolidayResponse,
  CreateHolidayRequest,
  EmployeeHolidayParams,
  EmployeeHolidayResponse,
  HolidayPageResponse,
  HolidaySearchParams,
  UpdateHolidayRequest,
} from "@/features/holidays/types/holiday-types";
import type { ApiResponse } from "@/services/api-contract";
import { apiClient } from "@/services/api-client";

export async function createHoliday(
  request: CreateHolidayRequest,
): Promise<AdminHolidayResponse> {
  const response = await apiClient.post<ApiResponse<AdminHolidayResponse>>(
    "/admin/holidays",
    request,
  );
  return response.data.data;
}

export async function listAdminHolidays(
  params?: HolidaySearchParams,
): Promise<HolidayPageResponse> {
  const response = await apiClient.get<ApiResponse<HolidayPageResponse>>(
    "/admin/holidays",
    { params },
  );
  return response.data.data;
}

export async function getHolidayDetail(
  holidayId: string,
): Promise<AdminHolidayResponse> {
  const response = await apiClient.get<ApiResponse<AdminHolidayResponse>>(
    `/admin/holidays/${encodeURIComponent(holidayId)}`,
  );
  return response.data.data;
}

export async function updateHoliday(
  holidayId: string,
  request: UpdateHolidayRequest,
): Promise<AdminHolidayResponse> {
  const response = await apiClient.patch<ApiResponse<AdminHolidayResponse>>(
    `/admin/holidays/${encodeURIComponent(holidayId)}`,
    request,
  );
  return response.data.data;
}

export async function deactivateHoliday(
  holidayId: string,
): Promise<AdminHolidayResponse> {
  const response = await apiClient.patch<ApiResponse<AdminHolidayResponse>>(
    `/admin/holidays/${encodeURIComponent(holidayId)}/deactivate`,
  );
  return response.data.data;
}

export async function listEmployeeHolidays(
  params?: EmployeeHolidayParams,
): Promise<EmployeeHolidayResponse[]> {
  const response = await apiClient.get<ApiResponse<EmployeeHolidayResponse[]>>(
    "/holidays",
    { params },
  );
  return response.data.data;
}

export async function getUpcomingHolidays(): Promise<EmployeeHolidayResponse[]> {
  const response = await apiClient.get<ApiResponse<EmployeeHolidayResponse[]>>(
    "/holidays/upcoming",
  );
  return response.data.data;
}

