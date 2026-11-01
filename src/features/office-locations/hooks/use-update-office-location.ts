"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { synchronizeOfficeLocationQueries } from "@/features/office-locations/hooks/office-location-mutation-utils";
import { updateOfficeLocation } from "@/features/office-locations/services/office-location-service";
import type { UpdateOfficeLocationRequest } from "@/features/office-locations/types/office-location-types";

export function useUpdateOfficeLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      officeLocationId,
      request,
    }: {
      officeLocationId: string;
      request: UpdateOfficeLocationRequest;
    }) => updateOfficeLocation(officeLocationId, request),
    onSuccess: (officeLocation) =>
      synchronizeOfficeLocationQueries(queryClient, officeLocation),
  });
}

