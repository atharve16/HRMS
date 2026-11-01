import type { QueryClient } from "@tanstack/react-query";

import { officeLocationKeys } from "@/features/office-locations/hooks/office-location-query-keys";
import type { OfficeLocation } from "@/features/office-locations/types/office-location-types";

export function synchronizeOfficeLocationQueries(
  queryClient: QueryClient,
  officeLocation: OfficeLocation,
) {
  queryClient.setQueryData(
    officeLocationKeys.detail(officeLocation.id),
    officeLocation,
  );
  void queryClient.invalidateQueries({ queryKey: officeLocationKeys.lists() });
  void queryClient.invalidateQueries({ queryKey: officeLocationKeys.options() });
}

