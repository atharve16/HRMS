import type {
  CreateShiftRequest,
  Shift,
  ShiftListParams,
  ShiftPage,
  UpdateShiftRequest,
} from "@/features/shifts/types/shift-types";
import type { ApiResponse } from "@/services/api-contract";
import { apiClient } from "@/services/api-client";

export async function listShifts(params: ShiftListParams) {
  const response = await apiClient.get<ApiResponse<ShiftPage>>(
    "/admin/shifts",
    { params },
  );
  return response.data.data;
}

export async function listShiftOptions() {
  return listShifts({
    page: 0,
    limit: 100,
    sortBy: "name",
    sortDirection: "asc",
  });
}

export async function getShift(shiftId: string) {
  const response = await apiClient.get<ApiResponse<Shift>>(
    `/admin/shifts/${shiftId}`,
  );
  return response.data.data;
}

export async function createShift(request: CreateShiftRequest) {
  const response = await apiClient.post<ApiResponse<Shift>>(
    "/admin/shifts",
    request,
  );
  return response.data.data;
}

export async function updateShift(
  shiftId: string,
  request: UpdateShiftRequest,
) {
  const response = await apiClient.patch<ApiResponse<Shift>>(
    `/admin/shifts/${shiftId}`,
    request,
  );
  return response.data.data;
}

export async function deactivateShift(shiftId: string) {
  const response = await apiClient.patch<ApiResponse<Shift>>(
    `/admin/shifts/${shiftId}/deactivate`,
  );
  return response.data.data;
}

export async function reactivateShift(shiftId: string) {
  const response = await apiClient.patch<ApiResponse<Shift>>(
    `/admin/shifts/${shiftId}/reactivate`,
  );
  return response.data.data;
}

