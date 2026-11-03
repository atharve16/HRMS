import type {
  AdminPayrollParams,
  EmployeePayrollPageResponse,
  EmployeePayrollParams,
  EmployeePayrollResponse,
  GeneratePayrollRequest,
  PayrollGenerationSummary,
  PayrollPageResponse,
  PayrollResponse,
  SalaryStructureResponse,
  UpdateDraftPayrollRequest,
  UpsertSalaryRequest,
} from "@/features/payroll/types/payroll-types";
import type { ApiResponse } from "@/services/api-contract";
import { apiClient } from "@/services/api-client";

// Admin Salary
export async function upsertEmployeeSalary(
  employeeId: string,
  request: UpsertSalaryRequest,
): Promise<SalaryStructureResponse> {
  const response = await apiClient.put<ApiResponse<SalaryStructureResponse>>(
    `/admin/employees/${encodeURIComponent(employeeId)}/salary`,
    request,
  );
  return response.data.data;
}

export async function getEmployeeSalary(
  employeeId: string,
): Promise<SalaryStructureResponse> {
  const response = await apiClient.get<ApiResponse<SalaryStructureResponse>>(
    `/admin/employees/${encodeURIComponent(employeeId)}/salary`,
  );
  return response.data.data;
}

export async function getEmployeeSalaryHistory(
  employeeId: string,
): Promise<SalaryStructureResponse[]> {
  const response = await apiClient.get<ApiResponse<SalaryStructureResponse[]>>(
    `/admin/employees/${encodeURIComponent(employeeId)}/salary/history`,
  );
  return response.data.data;
}

// Admin Payroll
export async function generatePayroll(
  request: GeneratePayrollRequest,
): Promise<PayrollGenerationSummary> {
  const response = await apiClient.post<ApiResponse<PayrollGenerationSummary>>(
    "/admin/payroll/generate",
    request,
  );
  return response.data.data;
}

export async function listAdminPayrolls(
  params?: AdminPayrollParams,
): Promise<PayrollPageResponse> {
  const response = await apiClient.get<ApiResponse<PayrollPageResponse>>(
    "/admin/payroll",
    { params },
  );
  return response.data.data;
}

export async function getAdminPayrollDetail(
  payrollId: string,
): Promise<PayrollResponse> {
  const response = await apiClient.get<ApiResponse<PayrollResponse>>(
    `/admin/payroll/${encodeURIComponent(payrollId)}`,
  );
  return response.data.data;
}

export async function updateDraftPayroll(
  payrollId: string,
  request: UpdateDraftPayrollRequest,
): Promise<PayrollResponse> {
  const response = await apiClient.patch<ApiResponse<PayrollResponse>>(
    `/admin/payroll/${encodeURIComponent(payrollId)}`,
    request,
  );
  return response.data.data;
}

export async function reviewPayroll(
  payrollId: string,
): Promise<PayrollResponse> {
  const response = await apiClient.patch<ApiResponse<PayrollResponse>>(
    `/admin/payroll/${encodeURIComponent(payrollId)}/review`,
  );
  return response.data.data;
}

export async function finalizePayroll(
  payrollId: string,
): Promise<PayrollResponse> {
  const response = await apiClient.patch<ApiResponse<PayrollResponse>>(
    `/admin/payroll/${encodeURIComponent(payrollId)}/finalize`,
  );
  return response.data.data;
}

export async function payPayroll(
  payrollId: string,
): Promise<PayrollResponse> {
  const response = await apiClient.patch<ApiResponse<PayrollResponse>>(
    `/admin/payroll/${encodeURIComponent(payrollId)}/pay`,
  );
  return response.data.data;
}

// Employee Payroll
export async function getMyPayrolls(
  params?: EmployeePayrollParams,
): Promise<EmployeePayrollPageResponse> {
  const response = await apiClient.get<ApiResponse<EmployeePayrollPageResponse>>(
    "/payroll/me",
    { params },
  );
  return response.data.data;
}

export async function getMyPayrollDetail(
  payrollId: string,
): Promise<EmployeePayrollResponse> {
  const response = await apiClient.get<ApiResponse<EmployeePayrollResponse>>(
    `/payroll/me/${encodeURIComponent(payrollId)}`,
  );
  return response.data.data;
}

export const getEmployeePayrollDetail = getMyPayrollDetail;

