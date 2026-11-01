"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { synchronizeWorkAssignmentQueries } from "@/features/work-assignments/hooks/work-assignment-mutation-utils";
import { endWorkAssignment } from "@/features/work-assignments/services/work-assignment-service";
import type { EndAssignmentRequest } from "@/features/work-assignments/types/work-assignment-types";

export function useEndWorkAssignment(assignmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: EndAssignmentRequest) =>
      endWorkAssignment(assignmentId, request),
    onSuccess: (updated) => {
      synchronizeWorkAssignmentQueries(queryClient, updated);
    },
  });
}

