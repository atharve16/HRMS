import { describe, expect, it } from "vitest";

import { officeLocationFormSchema } from "@/features/office-locations/schemas/office-location-schemas";

const validOfficeLocation = {
  locationCode: "NYC-01",
  name: "New York HQ",
  description: "Manhattan office",
  addressLine1: "350 5th Ave",
  addressLine2: "Suite 400",
  city: "New York",
  state: "NY",
  postalCode: "10118",
  country: "USA",
  latitude: "40.7484",
  longitude: "-73.9857",
  geofenceRadiusMeters: "100",
  maximumGpsAccuracyMeters: "50",
};

describe("office location form schema", () => {
  it("accepts valid location payloads", () => {
    const result = officeLocationFormSchema.safeParse(validOfficeLocation);
    expect(result.success).toBe(true);
  });

  it("validates locationCode pattern and length", () => {
    expect(
      officeLocationFormSchema.safeParse({
        ...validOfficeLocation,
        locationCode: "A",
      }).success,
    ).toBe(false);
    expect(
      officeLocationFormSchema.safeParse({
        ...validOfficeLocation,
        locationCode: "INVALID CODE WITH SPACES",
      }).success,
    ).toBe(false);
    expect(
      officeLocationFormSchema.safeParse({
        ...validOfficeLocation,
        locationCode: "VALID_CODE-123",
      }).success,
    ).toBe(true);
  });

  it("validates latitude and longitude boundaries", () => {
    // Latitude out of bounds
    expect(
      officeLocationFormSchema.safeParse({
        ...validOfficeLocation,
        latitude: "91",
      }).success,
    ).toBe(false);
    expect(
      officeLocationFormSchema.safeParse({
        ...validOfficeLocation,
        latitude: "-90.1",
      }).success,
    ).toBe(false);
    expect(
      officeLocationFormSchema.safeParse({
        ...validOfficeLocation,
        latitude: "not-a-number",
      }).success,
    ).toBe(false);

    // Longitude out of bounds
    expect(
      officeLocationFormSchema.safeParse({
        ...validOfficeLocation,
        longitude: "181",
      }).success,
    ).toBe(false);
    expect(
      officeLocationFormSchema.safeParse({
        ...validOfficeLocation,
        longitude: "-180.5",
      }).success,
    ).toBe(false);

    // Valid edge cases
    expect(
      officeLocationFormSchema.safeParse({
        ...validOfficeLocation,
        latitude: "-90",
        longitude: "180",
      }).success,
    ).toBe(true);
  });

  it("validates geofence radius and GPS accuracy bounds", () => {
    // Radius <= 0 or > 10000
    expect(
      officeLocationFormSchema.safeParse({
        ...validOfficeLocation,
        geofenceRadiusMeters: "0",
      }).success,
    ).toBe(false);
    expect(
      officeLocationFormSchema.safeParse({
        ...validOfficeLocation,
        geofenceRadiusMeters: "10001",
      }).success,
    ).toBe(false);

    // Accuracy <= 0 or > 1000
    expect(
      officeLocationFormSchema.safeParse({
        ...validOfficeLocation,
        maximumGpsAccuracyMeters: "0",
      }).success,
    ).toBe(false);
    expect(
      officeLocationFormSchema.safeParse({
        ...validOfficeLocation,
        maximumGpsAccuracyMeters: "1001",
      }).success,
    ).toBe(false);

    // Empty optional values are valid
    expect(
      officeLocationFormSchema.safeParse({
        ...validOfficeLocation,
        geofenceRadiusMeters: "",
        maximumGpsAccuracyMeters: "",
      }).success,
    ).toBe(true);
  });

  it("enforces required address fields", () => {
    expect(
      officeLocationFormSchema.safeParse({
        ...validOfficeLocation,
        addressLine1: "",
      }).success,
    ).toBe(false);
    expect(
      officeLocationFormSchema.safeParse({
        ...validOfficeLocation,
        city: "",
      }).success,
    ).toBe(false);
    expect(
      officeLocationFormSchema.safeParse({
        ...validOfficeLocation,
        state: "",
      }).success,
    ).toBe(false);
    expect(
      officeLocationFormSchema.safeParse({
        ...validOfficeLocation,
        postalCode: "",
      }).success,
    ).toBe(false);
    expect(
      officeLocationFormSchema.safeParse({
        ...validOfficeLocation,
        country: "",
      }).success,
    ).toBe(false);
  });
});

