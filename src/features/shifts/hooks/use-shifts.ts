"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { shiftKeys } from "@/features/shifts/hooks/shift-query-keys";
import { listShifts } from "@/features/shifts/services/shift-service";
import type { ShiftListParams } from "@/features/shifts/types/shift-types";

export function shiftsQueryOptions(params: ShiftListParams) {
  return queryOptions({
    queryKey: shiftKeys.list(params),
    queryFn: () => listShifts(params),
    placeholderData: (previous) => previous,
  });
}

export function useShifts(params: ShiftListParams) {
  return useQuery(shiftsQueryOptions(params));
}

