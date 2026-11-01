import type {
  CreateAssignmentRequest,
  EndAssignmentRequest,
  WorkAssignment,
} from "@/features/work-assignments/types/work-assignment-types";
import type { ApiResponse } from "@/services/api-contract";
import { apiClient } from "@/services/api-client";

export async function createWorkAssignment(
  employeeId: string,
  request: CreateAssignmentRequest,
): Promise<WorkAssignment> {
  const response = await apiClient.post<ApiResponse<WorkAssignment>>(
    `/admin/employees/${employeeId}/work-assignments`,
    request,
  );
  return response.data.data;
}

export async function listEmployeeWorkAssignments(
  employeeId: string,
): Promise<WorkAssignment[]> {
  const response = await apiClient.get<ApiResponse<WorkAssignment[]>>(
    `/admin/employees/${employeeId}/work-assignments`,
  );
  return response.data.data;
}

export async function getWorkAssignment(
  assignmentId: string,
): Promise<WorkAssignment> {
  const response = await apiClient.get<ApiResponse<WorkAssignment>>(
    `/admin/work-assignments/${assignmentId}`,
  );
  return response.data.data;
}

export async function endWorkAssignment(
  assignmentId: string,
  request: EndAssignmentRequest,
): Promise<WorkAssignment> {
  const response = await apiClient.patch<ApiResponse<WorkAssignment>>(
    `/admin/work-assignments/${assignmentId}/end`,
    request,
  );
  return response.data.data;
}

