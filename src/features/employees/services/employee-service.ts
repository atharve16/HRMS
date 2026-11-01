import type {
  CreateEmployeeRequest,
  Employee,
  EmployeeListParams,
  EmployeePage,
  UpdateEmployeeRequest,
} from "@/features/employees/types/employee-types";
import type { ApiResponse } from "@/services/api-contract";
import { apiClient } from "@/services/api-client";

export async function listEmployees(params: EmployeeListParams) {
  const response = await apiClient.get<ApiResponse<EmployeePage>>(
    "/admin/employees",
    { params },
  );
  return response.data.data;
}

export async function getEmployee(employeeId: string) {
  const response = await apiClient.get<ApiResponse<Employee>>(
    `/admin/employees/${employeeId}`,
  );
  return response.data.data;
}

export async function createEmployee(request: CreateEmployeeRequest) {
  const response = await apiClient.post<ApiResponse<Employee>>(
    "/admin/employees",
    request,
  );
  return response.data.data;
}

export async function updateEmployee(
  employeeId: string,
  request: UpdateEmployeeRequest,
) {
  const response = await apiClient.patch<ApiResponse<Employee>>(
    `/admin/employees/${employeeId}`,
    request,
  );
  return response.data.data;
}

export async function deactivateEmployee(employeeId: string) {
  const response = await apiClient.patch<ApiResponse<Employee>>(
    `/admin/employees/${employeeId}/deactivate`,
  );
  return response.data.data;
}

export async function reactivateEmployee(employeeId: string) {
  const response = await apiClient.patch<ApiResponse<Employee>>(
    `/admin/employees/${employeeId}/reactivate`,
  );
  return response.data.data;
}

export async function getMyEmployeeProfile() {
  const response = await apiClient.get<ApiResponse<Employee>>("/employees/me");
  return response.data.data;
}
