export const workAssignmentKeys = {
  all: ["work-assignments"] as const,
  byEmployees: () => [...workAssignmentKeys.all, "employee"] as const,
  byEmployee: (employeeId: string) =>
    [...workAssignmentKeys.byEmployees(), employeeId] as const,
  details: () => [...workAssignmentKeys.all, "detail"] as const,
  detail: (assignmentId: string) =>
    [...workAssignmentKeys.details(), assignmentId] as const,
};

