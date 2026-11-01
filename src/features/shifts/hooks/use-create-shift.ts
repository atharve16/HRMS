"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { synchronizeShiftQueries } from "@/features/shifts/hooks/shift-mutation-utils";
import { createShift } from "@/features/shifts/services/shift-service";

export function useCreateShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createShift,
    onSuccess: (shift) => synchronizeShiftQueries(queryClient, shift),
  });
}

