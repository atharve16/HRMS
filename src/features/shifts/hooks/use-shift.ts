"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { shiftKeys } from "@/features/shifts/hooks/shift-query-keys";
import {
  getShift,
  listShiftOptions,
} from "@/features/shifts/services/shift-service";

export function shiftQueryOptions(shiftId: string) {
  return queryOptions({
    queryKey: shiftKeys.detail(shiftId),
    queryFn: () => getShift(shiftId),
    enabled: Boolean(shiftId),
  });
}

export function useShift(shiftId: string) {
  return useQuery(shiftQueryOptions(shiftId));
}

export function useShiftOptions() {
  return useQuery({
    queryKey: shiftKeys.options(),
    queryFn: listShiftOptions,
    staleTime: 5 * 60_000,
  });
}

