export type AssignmentStatus = "ACTIVE" | "INACTIVE";

export interface WorkAssignment {
  id: string;
  employeeId: string;
  shiftId: string;
  officeLocationId: string;
  effectiveFrom: string;
  effectiveTo: string | null;
  status: AssignmentStatus;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAssignmentRequest {
  shiftId: string;
  officeLocationId: string;
  effectiveFrom: string;
  effectiveTo?: string | null;
  reason?: string | null;
}

export interface EndAssignmentRequest {
  effectiveTo: string;
  reason?: string | null;
}

