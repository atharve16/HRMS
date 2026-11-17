import type {
  AllocateLeaveBalanceRequest,
  ApplyLeaveRequest,
  EmployeeLeaveParams,
  LeaveBalanceResponse,
  LeaveAllocationRequest,
  LeaveDashboardResponse,
  LeaveLedgerEntryResponse,
  LeavePeriodBalanceResponse,
  LeavePolicyRequest,
  LeavePolicyResponse,
  LeaveRequestPageResponse,
  LeaveRequestResponse,
  LeaveSearchParams,
  RejectLeaveRequest,
} from "@/features/leaves/types/leave-types";
import type { ApiResponse } from "@/services/api-contract";
import { apiClient } from "@/services/api-client";

export async function applyLeave(
  request: ApplyLeaveRequest,
): Promise<LeaveRequestResponse> {
  const response = await apiClient.post<ApiResponse<LeaveRequestResponse>>(
    "/leaves",
    request,
  );
  return response.data.data;
}

export async function getMyLeaves(
  params?: EmployeeLeaveParams,
): Promise<LeaveRequestPageResponse> {
  const response = await apiClient.get<ApiResponse<LeaveRequestPageResponse>>(
    "/leaves/me",
    { params },
  );
  return response.data.data;
}

export async function getMyLeaveBalances(
  year?: number,
): Promise<LeaveBalanceResponse[]> {
  const response = await apiClient.get<ApiResponse<LeaveBalanceResponse[]>>(
    "/leaves/me/balance",
    { params: year !== undefined ? { year } : undefined },
  );
  return response.data.data;
}

export async function cancelLeave(
  leaveId: string,
): Promise<LeaveRequestResponse> {
  const response = await apiClient.patch<ApiResponse<LeaveRequestResponse>>(
    `/leaves/${encodeURIComponent(leaveId)}/cancel`,
  );
  return response.data.data;
}

export async function listAdminLeaves(
  params?: LeaveSearchParams,
): Promise<LeaveRequestPageResponse> {
  const response = await apiClient.get<ApiResponse<LeaveRequestPageResponse>>(
    "/admin/leaves",
    { params },
  );
  return response.data.data;
}

export async function getLeaveDetail(
  leaveId: string,
): Promise<LeaveRequestResponse> {
  const response = await apiClient.get<ApiResponse<LeaveRequestResponse>>(
    `/admin/leaves/${encodeURIComponent(leaveId)}`,
  );
  return response.data.data;
}

export async function approveLeave(
  leaveId: string,
): Promise<LeaveRequestResponse> {
  const response = await apiClient.patch<ApiResponse<LeaveRequestResponse>>(
    `/admin/leaves/${encodeURIComponent(leaveId)}/approve`,
  );
  return response.data.data;
}

export async function rejectLeave(
  leaveId: string,
  request: RejectLeaveRequest,
): Promise<LeaveRequestResponse> {
  const response = await apiClient.patch<ApiResponse<LeaveRequestResponse>>(
    `/admin/leaves/${encodeURIComponent(leaveId)}/reject`,
    request,
  );
  return response.data.data;
}

export async function getEmployeeLeaveBalances(
  employeeId: string,
  year?: number,
): Promise<LeaveBalanceResponse[]> {
  const response = await apiClient.get<ApiResponse<LeaveBalanceResponse[]>>(
    `/admin/employees/${encodeURIComponent(employeeId)}/leave-balance`,
    { params: year !== undefined ? { year } : undefined },
  );
  return response.data.data;
}

export async function allocateEmployeeLeaveBalance(
  employeeId: string,
  request: AllocateLeaveBalanceRequest,
): Promise<LeaveBalanceResponse> {
  const response = await apiClient.put<ApiResponse<LeaveBalanceResponse>>(
    `/admin/employees/${encodeURIComponent(employeeId)}/leave-balance`,
    request,
  );
  return response.data.data;
}

export async function getMyMonthlyLeaveBalances(month: string): Promise<LeavePeriodBalanceResponse[]> {
  const response = await apiClient.get<ApiResponse<LeavePeriodBalanceResponse[]>>(
    "/leaves/me/period-balance", { params: { month } },
  );
  return response.data.data;
}

export async function getEmployeeMonthlyLeaveBalances(employeeId: string, month: string) {
  const response = await apiClient.get<ApiResponse<LeavePeriodBalanceResponse[]>>(
    `/admin/leave-allocation/employees/${encodeURIComponent(employeeId)}/balances`, { params: { month } },
  );
  return response.data.data;
}

export async function getEmployeeLeaveAllocationHistory(employeeId: string, month: string) {
  const response = await apiClient.get<ApiResponse<LeaveLedgerEntryResponse[]>>(
    `/admin/leave-allocation/employees/${encodeURIComponent(employeeId)}/history`, { params: { month } },
  );
  return response.data.data;
}

export async function allocateMonthlyLeave(employeeId: string, request: LeaveAllocationRequest) {
  const response = await apiClient.post<ApiResponse<LeavePeriodBalanceResponse>>(
    `/admin/leave-allocation/employees/${encodeURIComponent(employeeId)}/allocations`, request,
  );
  return response.data.data;
}

export async function saveCompanyLeavePolicy(request: LeavePolicyRequest) {
  const response = await apiClient.put<ApiResponse<LeavePolicyResponse>>("/admin/leave-allocation/policies/company", request);
  return response.data.data;
}

export async function saveEmployeeLeavePolicy(employeeId: string, request: LeavePolicyRequest) {
  const response = await apiClient.put<ApiResponse<LeavePolicyResponse>>(`/admin/leave-allocation/employees/${encodeURIComponent(employeeId)}/policies`, request);
  return response.data.data;
}

export async function getLeaveDashboard(month: string) {
  const response = await apiClient.get<ApiResponse<LeaveDashboardResponse>>("/admin/leave-allocation/dashboard", { params: { month } });
  return response.data.data;
}

