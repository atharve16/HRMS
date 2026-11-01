import type {
  CreateOfficeLocationRequest,
  OfficeLocation,
  OfficeLocationListParams,
  OfficeLocationPage,
  UpdateOfficeLocationRequest,
} from "@/features/office-locations/types/office-location-types";
import type { ApiResponse } from "@/services/api-contract";
import { apiClient } from "@/services/api-client";

export async function listOfficeLocations(params: OfficeLocationListParams) {
  const response = await apiClient.get<ApiResponse<OfficeLocationPage>>(
    "/admin/office-locations",
    { params },
  );
  return response.data.data;
}

export async function listOfficeLocationOptions() {
  return listOfficeLocations({
    page: 0,
    limit: 100,
    sortBy: "name",
    sortDirection: "asc",
  });
}

export async function getOfficeLocation(officeLocationId: string) {
  const response = await apiClient.get<ApiResponse<OfficeLocation>>(
    `/admin/office-locations/${officeLocationId}`,
  );
  return response.data.data;
}

export async function createOfficeLocation(request: CreateOfficeLocationRequest) {
  const response = await apiClient.post<ApiResponse<OfficeLocation>>(
    "/admin/office-locations",
    request,
  );
  return response.data.data;
}

export async function updateOfficeLocation(
  officeLocationId: string,
  request: UpdateOfficeLocationRequest,
) {
  const response = await apiClient.patch<ApiResponse<OfficeLocation>>(
    `/admin/office-locations/${officeLocationId}`,
    request,
  );
  return response.data.data;
}

export async function deactivateOfficeLocation(officeLocationId: string) {
  const response = await apiClient.patch<ApiResponse<OfficeLocation>>(
    `/admin/office-locations/${officeLocationId}/deactivate`,
  );
  return response.data.data;
}

export async function reactivateOfficeLocation(officeLocationId: string) {
  const response = await apiClient.patch<ApiResponse<OfficeLocation>>(
    `/admin/office-locations/${officeLocationId}/reactivate`,
  );
  return response.data.data;
}

