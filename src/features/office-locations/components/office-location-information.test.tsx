import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { OfficeLocationInformation } from "@/features/office-locations/components/office-location-information";
import { OfficeLocationStatusBadge } from "@/features/office-locations/components/office-location-status-badge";
import type { OfficeLocation } from "@/features/office-locations/types/office-location-types";

const mockLocation: OfficeLocation = {
  id: "6724a1b2c3d4e5f60718293a",
  locationCode: "HQ-SF",
  name: "San Francisco Global HQ",
  description: "Primary engineering and executive hub",
  addressLine1: "500 Howard Street",
  addressLine2: "Suite 1200",
  city: "San Francisco",
  state: "CA",
  postalCode: "94105",
  country: "United States",
  latitude: 37.7891,
  longitude: -122.3972,
  geofenceRadiusMeters: 150,
  maximumGpsAccuracyMeters: 45,
  status: "ACTIVE",
  createdAt: "2026-11-01T12:00:00Z",
  updatedAt: "2026-11-01T12:00:00Z",
};

describe("office location presentation components", () => {
  it("renders status badges for ACTIVE and INACTIVE states", () => {
    const activeHtml = renderToStaticMarkup(
      <OfficeLocationStatusBadge status="ACTIVE" />,
    );
    expect(activeHtml).toContain("Active");

    const inactiveHtml = renderToStaticMarkup(
      <OfficeLocationStatusBadge status="INACTIVE" />,
    );
    expect(inactiveHtml).toContain("Inactive");
  });

  it("renders detailed office location overview, coordinates, address, and GeoJSON", () => {
    const html = renderToStaticMarkup(
      <OfficeLocationInformation officeLocation={mockLocation} />,
    );

    // Basic & Header
    expect(html).toContain("San Francisco Global HQ");
    expect(html).toContain("HQ-SF");
    expect(html).toContain("Primary engineering and executive hub");

    // Address
    expect(html).toContain("500 Howard Street");
    expect(html).toContain("Suite 1200");
    expect(html).toContain("San Francisco");
    expect(html).toContain("CA");
    expect(html).toContain("94105");
    expect(html).toContain("United States");

    // Coordinates and Geofence
    expect(html).toContain("37.7891°");
    expect(html).toContain("-122.3972°");
    // GeoJSON coordinate ordering check: [-122.3972, 37.7891]
    expect(html).toContain("[-122.3972, 37.7891]");
    expect(html).toContain("150 meters");
    expect(html).toContain("45 meters");

    // External map links
    expect(html).toContain("openstreetmap.org");
    expect(html).toContain("google.com/maps");
  });
});

