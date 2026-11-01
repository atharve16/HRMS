"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { synchronizeShiftQueries } from "@/features/shifts/hooks/shift-mutation-utils";
import { updateShift } from "@/features/shifts/services/shift-service";
import type { UpdateShiftRequest } from "@/features/shifts/types/shift-types";

export function useUpdateShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      shiftId,
      request,
    }: {
      shiftId: string;
      request: UpdateShiftRequest;
    }) => updateShift(shiftId, request),
    onSuccess: (shift) => synchronizeShiftQueries(queryClient, shift),
  });
}

