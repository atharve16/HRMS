import type {
  Coordinates,
  GeoJsonPoint,
  GeoJsonPosition,
} from "@/features/office-locations/types/office-location-types";

export function isValidLatitude(lat: number): boolean {
  return Number.isFinite(lat) && lat >= -90 && lat <= 90;
}

export function isValidLongitude(lon: number): boolean {
  return Number.isFinite(lon) && lon >= -180 && lon <= 180;
}

export function isValidCoordinatePair(lat: number, lon: number): boolean {
  return isValidLatitude(lat) && isValidLongitude(lon);
}

/**
 * Transforms standard { latitude, longitude } into GeoJSON position [longitude, latitude].
 * Note: GeoJSON specification (RFC 7946) mandates [longitude, latitude] coordinate ordering.
 */
export function coordinatesToGeoJson(coords: Coordinates): GeoJsonPosition {
  if (!isValidCoordinatePair(coords.latitude, coords.longitude)) {
    throw new RangeError(
      `Invalid coordinates: latitude must be between -90 and 90, longitude between -180 and 180. Received lat: ${coords.latitude}, lon: ${coords.longitude}`,
    );
  }
  return [coords.longitude, coords.latitude];
}

/**
 * Transforms a GeoJSON position [longitude, latitude] into { latitude, longitude }.
 */
export function geoJsonToCoordinates(position: GeoJsonPosition): Coordinates {
  const [longitude, latitude] = position;
  if (!isValidCoordinatePair(latitude, longitude)) {
    throw new RangeError(
      `Invalid GeoJSON position: latitude must be between -90 and 90, longitude between -180 and 180. Received lon: ${longitude}, lat: ${latitude}`,
    );
  }
  return { latitude, longitude };
}

/**
 * Constructs a valid GeoJSON Point geometry object from coordinates.
 */
export function toGeoJsonPoint(latitude: number, longitude: number): GeoJsonPoint {
  return {
    type: "Point",
    coordinates: coordinatesToGeoJson({ latitude, longitude }),
  };
}

/**
 * Formats coordinates for human-readable display with cardinal directions (N/S, E/W).
 */
export function formatCoordinatesDisplay(latitude: number, longitude: number): string {
  if (!isValidCoordinatePair(latitude, longitude)) {
    return "Invalid coordinates";
  }
  const latDir = latitude >= 0 ? "N" : "S";
  const lonDir = longitude >= 0 ? "E" : "W";
  const absLat = Math.abs(latitude).toFixed(6);
  const absLon = Math.abs(longitude).toFixed(6);
  return `${absLat}° ${latDir}, ${absLon}° ${lonDir}`;
}

/**
 * Generates external map links without requiring paid mapping APIs.
 */
export function getExternalMapUrls(latitude: number, longitude: number) {
  return {
    openStreetMap: `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`,
    googleMaps: `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`,
  };
}

