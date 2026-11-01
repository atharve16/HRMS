"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { synchronizeOfficeLocationQueries } from "@/features/office-locations/hooks/office-location-mutation-utils";
import { createOfficeLocation } from "@/features/office-locations/services/office-location-service";

export function useCreateOfficeLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOfficeLocation,
    onSuccess: (officeLocation) =>
      synchronizeOfficeLocationQueries(queryClient, officeLocation),
  });
}

