"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { workAssignmentKeys } from "@/features/work-assignments/hooks/work-assignment-query-keys";
import { listEmployeeWorkAssignments } from "@/features/work-assignments/services/work-assignment-service";

export function employeeWorkAssignmentsQueryOptions(employeeId: string) {
  return queryOptions({
    queryKey: workAssignmentKeys.byEmployee(employeeId),
    queryFn: () => listEmployeeWorkAssignments(employeeId),
    enabled: Boolean(employeeId),
  });
}

export function useEmployeeWorkAssignments(employeeId: string) {
  return useQuery(employeeWorkAssignmentsQueryOptions(employeeId));
}

