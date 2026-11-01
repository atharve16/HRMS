import type { OfficeLocationListParams } from "@/features/office-locations/types/office-location-types";

export const officeLocationKeys = {
  all: ["office-locations"] as const,
  lists: () => [...officeLocationKeys.all, "list"] as const,
  list: (params: OfficeLocationListParams) =>
    [...officeLocationKeys.lists(), params] as const,
  details: () => [...officeLocationKeys.all, "detail"] as const,
  detail: (officeLocationId: string) =>
    [...officeLocationKeys.details(), officeLocationId] as const,
  options: () => [...officeLocationKeys.all, "options"] as const,
};

