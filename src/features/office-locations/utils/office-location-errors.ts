import type { FieldPath, UseFormSetError } from "react-hook-form";

import type { OfficeLocationFormValues } from "@/features/office-locations/schemas/office-location-schemas";
import { isApiClientError } from "@/services/api-error";

const backendFieldMap: Record<string, FieldPath<OfficeLocationFormValues>> = {
  locationCode: "locationCode",
  name: "name",
  description: "description",
  addressLine1: "addressLine1",
  addressLine2: "addressLine2",
  city: "city",
  state: "state",
  postalCode: "postalCode",
  country: "country",
  coordinates: "latitude",
  "coordinates.latitude": "latitude",
  "coordinates.longitude": "longitude",
  latitude: "latitude",
  longitude: "longitude",
  geofenceRadiusMeters: "geofenceRadiusMeters",
  maximumGpsAccuracyMeters: "maximumGpsAccuracyMeters",
};

export function applyOfficeLocationFieldErrors(
  error: unknown,
  setError: UseFormSetError<OfficeLocationFormValues>,
) {
  if (!isApiClientError(error)) return false;
  let applied = false;
  Object.entries(error.details).forEach(([field, message]) => {
    const formField = backendFieldMap[field];
    if (formField) {
      setError(formField, { type: "server", message });
      applied = true;
    }
  });
  return applied;
}

export function getOfficeLocationErrorMessage(error: unknown) {
  if (!isApiClientError(error)) {
    return "Something went wrong. Please try again.";
  }
  if (!error.status) {
    return "The HRMS service could not be reached. Check your connection and try again.";
  }
  if (error.code === "CONFLICT") {
    return error.message;
  }
  if (error.code === "RESOURCE_NOT_FOUND") {
    return error.message;
  }
  if (error.code === "VALIDATION_ERROR") {
    return "Some office location information is invalid. Review the form and try again.";
  }
  if (error.status >= 500) {
    return "The HRMS service is unavailable right now. Please try again shortly.";
  }
  return error.message;
}

export function isOfficeLocationNotFoundError(error: unknown) {
  return isApiClientError(error) && error.status === 404;
}

