"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { synchronizeOfficeLocationQueries } from "@/features/office-locations/hooks/office-location-mutation-utils";
import { reactivateOfficeLocation } from "@/features/office-locations/services/office-location-service";

export function useReactivateOfficeLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reactivateOfficeLocation,
    onSuccess: (officeLocation) =>
      synchronizeOfficeLocationQueries(queryClient, officeLocation),
  });
}

