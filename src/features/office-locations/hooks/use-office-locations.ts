"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { officeLocationKeys } from "@/features/office-locations/hooks/office-location-query-keys";
import { listOfficeLocations } from "@/features/office-locations/services/office-location-service";
import type { OfficeLocationListParams } from "@/features/office-locations/types/office-location-types";

export function officeLocationsQueryOptions(params: OfficeLocationListParams) {
  return queryOptions({
    queryKey: officeLocationKeys.list(params),
    queryFn: () => listOfficeLocations(params),
    placeholderData: (previous) => previous,
  });
}

export function useOfficeLocations(params: OfficeLocationListParams) {
  return useQuery(officeLocationsQueryOptions(params));
}

