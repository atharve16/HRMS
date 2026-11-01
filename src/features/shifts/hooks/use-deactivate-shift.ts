"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { synchronizeShiftQueries } from "@/features/shifts/hooks/shift-mutation-utils";
import { deactivateShift } from "@/features/shifts/services/shift-service";

export function useDeactivateShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateShift,
    onSuccess: (shift) => synchronizeShiftQueries(queryClient, shift),
  });
}

