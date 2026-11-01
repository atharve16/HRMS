import type { OfficeLocationFormValues } from "@/features/office-locations/schemas/office-location-schemas";
import type {
  CreateOfficeLocationRequest,
  OfficeLocation,
  UpdateOfficeLocationRequest,
} from "@/features/office-locations/types/office-location-types";

const optional = (value: string) => value.trim() || undefined;

export const emptyOfficeLocationFormValues: OfficeLocationFormValues = {
  locationCode: "",
  name: "",
  description: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  latitude: "",
  longitude: "",
  geofenceRadiusMeters: "100",
  maximumGpsAccuracyMeters: "50",
};

export function officeLocationToFormValues(
  office: OfficeLocation,
): OfficeLocationFormValues {
  return {
    locationCode: office.locationCode,
    name: office.name,
    description: office.description ?? "",
    addressLine1: office.addressLine1,
    addressLine2: office.addressLine2 ?? "",
    city: office.city,
    state: office.state,
    postalCode: office.postalCode,
    country: office.country,
    latitude: String(office.latitude),
    longitude: String(office.longitude),
    geofenceRadiusMeters: String(office.geofenceRadiusMeters),
    maximumGpsAccuracyMeters: String(office.maximumGpsAccuracyMeters),
  };
}

export function toCreateOfficeLocationRequest(
  values: OfficeLocationFormValues,
): CreateOfficeLocationRequest {
  const radius = values.geofenceRadiusMeters.trim();
  const accuracy = values.maximumGpsAccuracyMeters.trim();

  return {
    locationCode: values.locationCode.trim().toUpperCase(),
    name: values.name.trim(),
    description: optional(values.description),
    addressLine1: values.addressLine1.trim(),
    addressLine2: optional(values.addressLine2),
    city: values.city.trim(),
    state: values.state.trim(),
    postalCode: values.postalCode.trim(),
    country: values.country.trim(),
    coordinates: {
      latitude: Number(values.latitude),
      longitude: Number(values.longitude),
    },
    geofenceRadiusMeters: radius ? Number(radius) : undefined,
    maximumGpsAccuracyMeters: accuracy ? Number(accuracy) : undefined,
  };
}

export function toUpdateOfficeLocationRequest(
  values: OfficeLocationFormValues,
  office: OfficeLocation,
): UpdateOfficeLocationRequest {
  const request: UpdateOfficeLocationRequest = {};

  const code = values.locationCode.trim().toUpperCase();
  const name = values.name.trim();
  const description = values.description.trim();
  const addressLine1 = values.addressLine1.trim();
  const addressLine2 = values.addressLine2.trim();
  const city = values.city.trim();
  const state = values.state.trim();
  const postalCode = values.postalCode.trim();
  const country = values.country.trim();

  if (code !== office.locationCode) {
    request.locationCode = code;
  }
  if (name !== office.name) {
    request.name = name;
  }
  if (description !== (office.description ?? "")) {
    request.description = description;
  }
  if (addressLine1 !== office.addressLine1) {
    request.addressLine1 = addressLine1;
  }
  if (addressLine2 !== (office.addressLine2 ?? "")) {
    request.addressLine2 = addressLine2;
  }
  if (city !== office.city) {
    request.city = city;
  }
  if (state !== office.state) {
    request.state = state;
  }
  if (postalCode !== office.postalCode) {
    request.postalCode = postalCode;
  }
  if (country !== office.country) {
    request.country = country;
  }

  const latNum = Number(values.latitude);
  const lonNum = Number(values.longitude);
  if (latNum !== office.latitude || lonNum !== office.longitude) {
    request.coordinates = {
      latitude: latNum,
      longitude: lonNum,
    };
  }

  const radiusNum = Number(values.geofenceRadiusMeters);
  if (radiusNum !== office.geofenceRadiusMeters) {
    request.geofenceRadiusMeters = radiusNum;
  }

  const accuracyNum = Number(values.maximumGpsAccuracyMeters);
  if (accuracyNum !== office.maximumGpsAccuracyMeters) {
    request.maximumGpsAccuracyMeters = accuracyNum;
  }

  return request;
}

