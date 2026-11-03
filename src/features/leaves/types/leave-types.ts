export type LeaveType = "CL" | "SL" | "EL" | "LWP" | "CO";

export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

export interface ApplyLeaveRequest {
  leaveType: LeaveType;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  reason: string;
}

export interface RejectLeaveRequest {
  remarks: string;
}

export interface AllocateLeaveBalanceRequest {
  leaveType: LeaveType;
  year: number;
  allocatedDays: number;
}

export interface LeaveRequestResponse {
  id: string;
  employeeId: string;
  employeeCode: string;
  leaveType: LeaveType;
  leaveTypeName: string;
  startDate: string; // "YYYY-MM-DD"
  endDate: string; // "YYYY-MM-DD"
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  paid: boolean;
  adminRemarks: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface LeaveBalanceResponse {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  leaveTypeName: string;
  year: number;
  allocatedDays: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface LeaveRequestPageResponse {
  content: LeaveRequestResponse[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface EmployeeLeaveParams {
  status?: LeaveStatus;
  leaveType?: LeaveType;
  fromDate?: string; // "YYYY-MM-DD"
  toDate?: string; // "YYYY-MM-DD"
  page?: number;
  limit?: number;
}

export interface LeaveSearchParams extends EmployeeLeaveParams {
  employeeId?: string;
  employeeCode?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

