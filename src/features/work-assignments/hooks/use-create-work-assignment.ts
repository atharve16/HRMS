"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { synchronizeWorkAssignmentQueries } from "@/features/work-assignments/hooks/work-assignment-mutation-utils";
import { createWorkAssignment } from "@/features/work-assignments/services/work-assignment-service";
import type { CreateAssignmentRequest } from "@/features/work-assignments/types/work-assignment-types";

export function useCreateWorkAssignment(employeeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateAssignmentRequest) =>
      createWorkAssignment(employeeId, request),
    onSuccess: (created) => {
      synchronizeWorkAssignmentQueries(queryClient, created);
    },
  });
}

