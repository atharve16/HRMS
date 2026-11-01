"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { officeLocationKeys } from "@/features/office-locations/hooks/office-location-query-keys";
import {
  getOfficeLocation,
  listOfficeLocationOptions,
} from "@/features/office-locations/services/office-location-service";

export function officeLocationQueryOptions(officeLocationId: string) {
  return queryOptions({
    queryKey: officeLocationKeys.detail(officeLocationId),
    queryFn: () => getOfficeLocation(officeLocationId),
    enabled: Boolean(officeLocationId),
  });
}

export function useOfficeLocation(officeLocationId: string) {
  return useQuery(officeLocationQueryOptions(officeLocationId));
}

export function useOfficeLocationOptions() {
  return useQuery({
    queryKey: officeLocationKeys.options(),
    queryFn: listOfficeLocationOptions,
    staleTime: 5 * 60_000,
  });
}

