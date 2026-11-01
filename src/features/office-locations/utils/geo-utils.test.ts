import { describe, expect, it } from "vitest";

import {
  coordinatesToGeoJson,
  formatCoordinatesDisplay,
  geoJsonToCoordinates,
  getExternalMapUrls,
  isValidCoordinatePair,
  isValidLatitude,
  isValidLongitude,
  toGeoJsonPoint,
} from "@/features/office-locations/utils/geo-utils";

describe("geo-utils", () => {
  describe("coordinate range validators", () => {
    it("validates latitude range (-90 to 90)", () => {
      expect(isValidLatitude(0)).toBe(true);
      expect(isValidLatitude(90)).toBe(true);
      expect(isValidLatitude(-90)).toBe(true);
      expect(isValidLatitude(37.7749)).toBe(true);
      expect(isValidLatitude(90.1)).toBe(false);
      expect(isValidLatitude(-90.1)).toBe(false);
      expect(isValidLatitude(Number.NaN)).toBe(false);
      expect(isValidLatitude(Number.POSITIVE_INFINITY)).toBe(false);
    });

    it("validates longitude range (-180 to 180)", () => {
      expect(isValidLongitude(0)).toBe(true);
      expect(isValidLongitude(180)).toBe(true);
      expect(isValidLongitude(-180)).toBe(true);
      expect(isValidLongitude(-122.4194)).toBe(true);
      expect(isValidLongitude(180.1)).toBe(false);
      expect(isValidLongitude(-180.1)).toBe(false);
      expect(isValidLongitude(Number.NaN)).toBe(false);
    });

    it("validates coordinate pair", () => {
      expect(isValidCoordinatePair(37.7749, -122.4194)).toBe(true);
      expect(isValidCoordinatePair(95, 0)).toBe(false);
      expect(isValidCoordinatePair(0, 185)).toBe(false);
    });
  });

  describe("GeoJSON transformations and coordinate ordering", () => {
    it("transforms { latitude, longitude } to GeoJSON [longitude, latitude] ordering", () => {
      const coords = { latitude: 40.7128, longitude: -74.006 };
      const geoJson = coordinatesToGeoJson(coords);
      // Index 0 must be longitude, Index 1 must be latitude
      expect(geoJson[0]).toBe(-74.006);
      expect(geoJson[1]).toBe(40.7128);
      expect(geoJson).toEqual([-74.006, 40.7128]);
    });

    it("throws RangeError when transforming invalid coordinates to GeoJSON", () => {
      expect(() => coordinatesToGeoJson({ latitude: 100, longitude: 0 })).toThrow(
        RangeError,
      );
      expect(() => coordinatesToGeoJson({ latitude: 0, longitude: 200 })).toThrow(
        RangeError,
      );
    });

    it("transforms GeoJSON [longitude, latitude] back to { latitude, longitude }", () => {
      const position: [number, number] = [-74.006, 40.7128];
      const coords = geoJsonToCoordinates(position);
      expect(coords.latitude).toBe(40.7128);
      expect(coords.longitude).toBe(-74.006);
    });

    it("creates a compliant GeoJSON Point object", () => {
      const point = toGeoJsonPoint(40.7128, -74.006);
      expect(point.type).toBe("Point");
      expect(point.coordinates).toEqual([-74.006, 40.7128]);
    });
  });

  describe("formatting and external links", () => {
    it("formats coordinates with hemisphere indicators", () => {
      expect(formatCoordinatesDisplay(40.7128, -74.006)).toBe(
        "40.712800° N, 74.006000° W",
      );
      expect(formatCoordinatesDisplay(-33.8688, 151.2093)).toBe(
        "33.868800° S, 151.209300° E",
      );
      expect(formatCoordinatesDisplay(0, 0)).toBe("0.000000° N, 0.000000° E");
    });

    it("returns error message for invalid coordinates formatting", () => {
      expect(formatCoordinatesDisplay(100, 0)).toBe("Invalid coordinates");
    });

    it("constructs valid external map links without API keys", () => {
      const urls = getExternalMapUrls(40.7128, -74.006);
      expect(urls.openStreetMap).toContain("openstreetmap.org");
      expect(urls.openStreetMap).toContain("mlat=40.7128");
      expect(urls.openStreetMap).toContain("mlon=-74.006");
      expect(urls.googleMaps).toContain("google.com/maps");
      expect(urls.googleMaps).toContain("query=40.7128,-74.006");
    });
  });
});

