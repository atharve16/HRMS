import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/office-locations/services/office-location-service", () => ({
  listOfficeLocations: vi.fn(),
}));

import { synchronizeOfficeLocationQueries } from "@/features/office-locations/hooks/office-location-mutation-utils";
import { officeLocationKeys } from "@/features/office-locations/hooks/office-location-query-keys";
import { officeLocationsQueryOptions } from "@/features/office-locations/hooks/use-office-locations";
import type { OfficeLocation } from "@/features/office-locations/types/office-location-types";

const officeLocation: OfficeLocation = {
  id: "loc-1",
  locationCode: "HQ-01",
  name: "Headquarters",
  description: "Global HQ",
  addressLine1: "100 Main St",
  city: "San Francisco",
  state: "CA",
  postalCode: "94105",
  country: "USA",
  latitude: 37.7749,
  longitude: -122.4194,
  geofenceRadiusMeters: 100,
  maximumGpsAccuracyMeters: 50,
  status: "ACTIVE",
};

describe("office location query behavior", () => {
  it("includes pagination, filters, and sorting in stable list keys", () => {
    const one = officeLocationsQueryOptions({
      page: 0,
      limit: 20,
      search: "HQ",
      status: "ACTIVE",
      sortBy: "name",
      sortDirection: "asc",
    });
    const two = officeLocationsQueryOptions({
      page: 1,
      limit: 20,
      search: "HQ",
      status: "ACTIVE",
      sortBy: "name",
      sortDirection: "asc",
    });
    expect(one.queryKey).toEqual([
      "office-locations",
      "list",
      {
        page: 0,
        limit: 20,
        search: "HQ",
        status: "ACTIVE",
        sortBy: "name",
        sortDirection: "asc",
      },
    ]);
    expect(one.queryKey).not.toEqual(two.queryKey);
    expect(typeof one.placeholderData).toBe("function");
  });

  it("updates detail data and invalidates lists and selector options", () => {
    const client = new QueryClient();
    client.setQueryData(
      officeLocationKeys.list({ page: 0, limit: 20 }),
      { content: [] },
    );
    client.setQueryData(officeLocationKeys.options(), {
      content: [officeLocation],
    });

    synchronizeOfficeLocationQueries(client, {
      ...officeLocation,
      name: "Global HQ",
    });

    expect(client.getQueryData(officeLocationKeys.detail("loc-1"))).toEqual(
      expect.objectContaining({ name: "Global HQ" }),
    );
    expect(
      client.getQueryState(officeLocationKeys.list({ page: 0, limit: 20 }))
        ?.isInvalidated,
    ).toBe(true);
    expect(
      client.getQueryState(officeLocationKeys.options())?.isInvalidated,
    ).toBe(true);
  });
});

