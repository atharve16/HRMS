"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { synchronizeOfficeLocationQueries } from "@/features/office-locations/hooks/office-location-mutation-utils";
import { deactivateOfficeLocation } from "@/features/office-locations/services/office-location-service";

export function useDeactivateOfficeLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateOfficeLocation,
    onSuccess: (officeLocation) =>
      synchronizeOfficeLocationQueries(queryClient, officeLocation),
  });
}

