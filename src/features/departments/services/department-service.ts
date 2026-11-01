import type {
  CreateDepartmentRequest,
  Department,
  DepartmentListParams,
  DepartmentPage,
  UpdateDepartmentRequest,
} from "@/features/departments/types/department-types";
import type { ApiResponse } from "@/services/api-contract";
import { apiClient } from "@/services/api-client";

export async function listDepartments(params: DepartmentListParams) {
  const response = await apiClient.get<ApiResponse<DepartmentPage>>(
    "/admin/departments",
    { params },
  );
  return response.data.data;
}

export async function listDepartmentOptions() {
  return listDepartments({
    page: 0,
    limit: 100,
    sortBy: "name",
    sortDirection: "asc",
  });
}

export async function getDepartment(departmentId: string) {
  const response = await apiClient.get<ApiResponse<Department>>(
    `/admin/departments/${departmentId}`,
  );
  return response.data.data;
}

export async function createDepartment(request: CreateDepartmentRequest) {
  const response = await apiClient.post<ApiResponse<Department>>(
    "/admin/departments",
    request,
  );
  return response.data.data;
}

export async function updateDepartment(
  departmentId: string,
  request: UpdateDepartmentRequest,
) {
  const response = await apiClient.patch<ApiResponse<Department>>(
    `/admin/departments/${departmentId}`,
    request,
  );
  return response.data.data;
}

export async function deactivateDepartment(departmentId: string) {
  const response = await apiClient.patch<ApiResponse<Department>>(
    `/admin/departments/${departmentId}/deactivate`,
  );
  return response.data.data;
}

export async function reactivateDepartment(departmentId: string) {
  const response = await apiClient.patch<ApiResponse<Department>>(
    `/admin/departments/${departmentId}/reactivate`,
  );
  return response.data.data;
}
