"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { synchronizeShiftQueries } from "@/features/shifts/hooks/shift-mutation-utils";
import { reactivateShift } from "@/features/shifts/services/shift-service";

export function useReactivateShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reactivateShift,
    onSuccess: (shift) => synchronizeShiftQueries(queryClient, shift),
  });
}

