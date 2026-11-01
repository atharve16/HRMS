import { describe, expect, it } from "vitest";

import type { OfficeLocation } from "@/features/office-locations/types/office-location-types";
import {
  emptyOfficeLocationFormValues,
  officeLocationToFormValues,
  toCreateOfficeLocationRequest,
  toUpdateOfficeLocationRequest,
} from "@/features/office-locations/utils/office-location-form-utils";

const officeLocation: OfficeLocation = {
  id: "loc-123",
  locationCode: "SF-HQ",
  name: "San Francisco Office",
  description: "Main headquarters",
  addressLine1: "123 Market St",
  addressLine2: "Suite 500",
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

describe("office location form utils", () => {
  it("provides sensible defaults in emptyOfficeLocationFormValues", () => {
    expect(emptyOfficeLocationFormValues.locationCode).toBe("");
    expect(emptyOfficeLocationFormValues.geofenceRadiusMeters).toBe("100");
    expect(emptyOfficeLocationFormValues.maximumGpsAccuracyMeters).toBe("50");
  });

  it("converts an OfficeLocation entity to form values", () => {
    const formValues = officeLocationToFormValues(officeLocation);
    expect(formValues).toEqual({
      locationCode: "SF-HQ",
      name: "San Francisco Office",
      description: "Main headquarters",
      addressLine1: "123 Market St",
      addressLine2: "Suite 500",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      country: "USA",
      latitude: "37.7749",
      longitude: "-122.4194",
      geofenceRadiusMeters: "100",
      maximumGpsAccuracyMeters: "50",
    });
  });

  it("transforms form values to CreateOfficeLocationRequest with uppercased code and numeric coordinates", () => {
    const formValues = {
      locationCode: "nyc-hq  ",
      name: "  New York Office  ",
      description: "  Regional branch  ",
      addressLine1: " 350 5th Ave ",
      addressLine2: "",
      city: " New York ",
      state: " NY ",
      postalCode: " 10118 ",
      country: " USA ",
      latitude: " 40.7484 ",
      longitude: " -73.9857 ",
      geofenceRadiusMeters: " 150 ",
      maximumGpsAccuracyMeters: " 40 ",
    };

    const request = toCreateOfficeLocationRequest(formValues);
    expect(request).toEqual({
      locationCode: "NYC-HQ",
      name: "New York Office",
      description: "Regional branch",
      addressLine1: "350 5th Ave",
      addressLine2: undefined,
      city: "New York",
      state: "NY",
      postalCode: "10118",
      country: "USA",
      coordinates: {
        latitude: 40.7484,
        longitude: -73.9857,
      },
      geofenceRadiusMeters: 150,
      maximumGpsAccuracyMeters: 40,
    });
  });

  it("builds a partial update request with only changed fields", () => {
    const formValues = officeLocationToFormValues(officeLocation);

    // No changes should result in empty object
    expect(toUpdateOfficeLocationRequest(formValues, officeLocation)).toEqual({});

    // Change coordinates and name only
    const updatedValues = {
      ...formValues,
      name: "SF Headquarters Campus",
      latitude: "37.7750",
      longitude: "-122.4195",
    };

    const patchRequest = toUpdateOfficeLocationRequest(updatedValues, officeLocation);
    expect(patchRequest).toEqual({
      name: "SF Headquarters Campus",
      coordinates: {
        latitude: 37.775,
        longitude: -122.4195,
      },
    });
    // Ensure untouched fields are not included in patch
    expect(patchRequest.locationCode).toBeUndefined();
    expect(patchRequest.addressLine1).toBeUndefined();
    expect(patchRequest.city).toBeUndefined();
  });
});

