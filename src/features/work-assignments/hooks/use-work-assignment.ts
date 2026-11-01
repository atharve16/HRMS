"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { workAssignmentKeys } from "@/features/work-assignments/hooks/work-assignment-query-keys";
import { getWorkAssignment } from "@/features/work-assignments/services/work-assignment-service";

export function workAssignmentQueryOptions(assignmentId: string) {
  return queryOptions({
    queryKey: workAssignmentKeys.detail(assignmentId),
    queryFn: () => getWorkAssignment(assignmentId),
    enabled: Boolean(assignmentId),
  });
}

export function useWorkAssignment(assignmentId: string) {
  return useQuery(workAssignmentQueryOptions(assignmentId));
}

