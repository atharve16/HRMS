import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn() }));
vi.mock("@/services/api-client", () => ({ apiClient: api }));

import {
  createOfficeLocation,
  deactivateOfficeLocation,
  getOfficeLocation,
  listOfficeLocationOptions,
  listOfficeLocations,
  reactivateOfficeLocation,
  updateOfficeLocation,
} from "@/features/office-locations/services/office-location-service";
import type { OfficeLocation } from "@/features/office-locations/types/office-location-types";
import { ApiClientError } from "@/services/api-error";

const officeLocation: OfficeLocation = {
  id: "6724a1b2c3d4e5f60718293a",
  locationCode: "HQ-01",
  name: "Headquarters",
  description: "Global Headquarters",
  addressLine1: "100 Main Street",
  addressLine2: "Floor 4",
  city: "San Francisco",
  state: "CA",
  postalCode: "94105",
  country: "USA",
  latitude: 37.7749,
  longitude: -122.4194,
  geofenceRadiusMeters: 100,
  maximumGpsAccuracyMeters: 50,
  status: "ACTIVE",
  createdAt: "2026-11-01T00:00:00Z",
  updatedAt: "2026-11-01T00:00:00Z",
};

const envelope = <T>(data: T) => ({
  data: { success: true, message: "ok", data, timestamp: "2026-11-01T00:00:00Z" },
});

beforeEach(() => {
  api.get.mockReset();
  api.post.mockReset();
  api.patch.mockReset();
});

describe("office location API service", () => {
  it("passes pagination, search, status, and sorting unchanged", async () => {
    const page = {
      content: [officeLocation],
      page: 0,
      limit: 20,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    };
    api.get.mockResolvedValue(envelope(page));
    const params = {
      page: 0,
      limit: 20,
      search: "HQ",
      status: "ACTIVE" as const,
      sortBy: "name" as const,
      sortDirection: "asc" as const,
    };
    await expect(listOfficeLocations(params)).resolves.toEqual(page);
    expect(api.get).toHaveBeenCalledWith("/admin/office-locations", { params });
  });

  it("loads bounded, alphabetized reference options", async () => {
    api.get.mockResolvedValue(
      envelope({
        content: [],
        page: 0,
        limit: 100,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
      }),
    );
    await listOfficeLocationOptions();
    expect(api.get).toHaveBeenCalledWith("/admin/office-locations", {
      params: { page: 0, limit: 100, sortBy: "name", sortDirection: "asc" },
    });
  });

  it("gets, creates, and partially updates an office location", async () => {
    api.get.mockResolvedValue(envelope(officeLocation));
    api.post.mockResolvedValue(envelope(officeLocation));
    api.patch.mockResolvedValue(envelope({ ...officeLocation, name: "SF Headquarters" }));

    await expect(getOfficeLocation(officeLocation.id)).resolves.toEqual(officeLocation);
    expect(api.get).toHaveBeenCalledWith(`/admin/office-locations/${officeLocation.id}`);

    const createPayload = {
      locationCode: "HQ-01",
      name: "Headquarters",
      addressLine1: "100 Main Street",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "USA",
      coordinates: { latitude: 37.7749, longitude: -122.4194 },
    };
    await createOfficeLocation(createPayload);
    expect(api.post).toHaveBeenCalledWith("/admin/office-locations", createPayload);

    await updateOfficeLocation(officeLocation.id, { name: "SF Headquarters" });
    expect(api.patch).toHaveBeenCalledWith(
      `/admin/office-locations/${officeLocation.id}`,
      { name: "SF Headquarters" },
    );
  });

  it("uses the dedicated lifecycle endpoints", async () => {
    api.patch.mockResolvedValue(envelope(officeLocation));
    await deactivateOfficeLocation(officeLocation.id);
    expect(api.patch).toHaveBeenNthCalledWith(
      1,
      `/admin/office-locations/${officeLocation.id}/deactivate`,
    );

    await reactivateOfficeLocation(officeLocation.id);
    expect(api.patch).toHaveBeenNthCalledWith(
      2,
      `/admin/office-locations/${officeLocation.id}/reactivate`,
    );
  });

  it("preserves duplicate and assignment safeguard conflicts", async () => {
    const conflict = new ApiClientError("Location code already exists", {
      status: 409,
      code: "CONFLICT",
    });
    api.post.mockRejectedValue(conflict);
    await expect(
      createOfficeLocation({
        locationCode: "HQ-01",
        name: "Headquarters",
        addressLine1: "100 Main Street",
        city: "San Francisco",
        state: "CA",
        postalCode: "94105",
        country: "USA",
        coordinates: { latitude: 37.7749, longitude: -122.4194 },
      }),
    ).rejects.toBe(conflict);

    api.patch.mockRejectedValue(
      new ApiClientError(
        "End active employee assignments before deactivating this location",
        { status: 409, code: "CONFLICT" },
      ),
    );
    await expect(deactivateOfficeLocation(officeLocation.id)).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });
});

