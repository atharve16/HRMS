export type OfficeStatus = "ACTIVE" | "INACTIVE";

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type GeoJsonPosition = [longitude: number, latitude: number];

export type GeoJsonPoint = {
  type: "Point";
  coordinates: GeoJsonPosition;
};

export type OfficeLocation = {
  id: string;
  locationCode: string;
  name: string;
  description?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  maximumGpsAccuracyMeters: number;
  status: OfficeStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type OfficeLocationPage = {
  content: OfficeLocation[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type OfficeLocationSortField =
  | "locationCode"
  | "name"
  | "city"
  | "status"
  | "createdAt";

export type OfficeLocationListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: OfficeStatus;
  sortBy?: OfficeLocationSortField;
  sortDirection?: "asc" | "desc";
};

export type CreateOfficeLocationRequest = {
  locationCode: string;
  name: string;
  description?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates: Coordinates;
  geofenceRadiusMeters?: number;
  maximumGpsAccuracyMeters?: number;
};

export type UpdateOfficeLocationRequest = {
  locationCode?: string;
  name?: string;
  description?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  coordinates?: Coordinates;
  geofenceRadiusMeters?: number;
  maximumGpsAccuracyMeters?: number;
};

