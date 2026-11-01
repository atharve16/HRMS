import { ExternalLink, Globe, MapPin, Navigation, ShieldCheck } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OfficeLocationStatusBadge } from "@/features/office-locations/components/office-location-status-badge";
import type { OfficeLocation } from "@/features/office-locations/types/office-location-types";
import {
  coordinatesToGeoJson,
  formatCoordinatesDisplay,
  getExternalMapUrls,
} from "@/features/office-locations/utils/geo-utils";
import {
  formatOfficeLocationAddress,
  formatOfficeLocationTimestamp,
} from "@/features/office-locations/utils/office-location-display";

function Value({ label, value }: { label: string; value?: string | number }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm text-foreground">
        {value !== undefined && value !== null && value !== ""
          ? String(value)
          : "Not provided"}
      </dd>
    </div>
  );
}

export function OfficeLocationInformation({
  officeLocation,
}: {
  officeLocation: OfficeLocation;
}) {
  const geoJsonCoords = coordinatesToGeoJson({
    latitude: officeLocation.latitude,
    longitude: officeLocation.longitude,
  });
  const mapUrls = getExternalMapUrls(
    officeLocation.latitude,
    officeLocation.longitude,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center">
          <span className="grid size-16 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <MapPin aria-hidden="true" className="size-8" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold">{officeLocation.name}</h2>
              <OfficeLocationStatusBadge status={officeLocation.status} />
            </div>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary">
              {officeLocation.locationCode}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatOfficeLocationAddress(officeLocation)}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe aria-hidden="true" className="size-5 text-primary" />
              Geographic & Geofence Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              <Value
                label="Latitude"
                value={`${officeLocation.latitude}°`}
              />
              <Value
                label="Longitude"
                value={`${officeLocation.longitude}°`}
              />
              <div className="sm:col-span-2">
                <Value
                  label="Display coordinates"
                  value={formatCoordinatesDisplay(
                    officeLocation.latitude,
                    officeLocation.longitude,
                  )}
                />
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  GeoJSON coordinate tuple [longitude, latitude]
                </dt>
                <dd className="mt-1 rounded-md bg-muted/60 p-2 font-mono text-xs text-foreground">
                  [{geoJsonCoords[0]}, {geoJsonCoords[1]}]
                </dd>
              </div>
              <Value
                label="Geofence radius"
                value={`${officeLocation.geofenceRadiusMeters} meters`}
              />
              <Value
                label="Max GPS accuracy allowed"
                value={`${officeLocation.maximumGpsAccuracyMeters} meters`}
              />
            </dl>

            <div className="mt-6 border-t border-border pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                External Maps
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                  href={mapUrls.openStreetMap}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Navigation aria-hidden="true" className="size-3.5" />
                  View on OpenStreetMap
                  <ExternalLink aria-hidden="true" className="size-3" />
                </a>
                <a
                  className={buttonVariants({ size: "sm", variant: "outline" })}
                  href={mapUrls.googleMaps}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Navigation aria-hidden="true" className="size-3.5" />
                  View on Google Maps
                  <ExternalLink aria-hidden="true" className="size-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin aria-hidden="true" className="size-5 text-primary" />
              Address Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Value label="Address line 1" value={officeLocation.addressLine1} />
              </div>
              <div className="sm:col-span-2">
                <Value label="Address line 2" value={officeLocation.addressLine2} />
              </div>
              <Value label="City" value={officeLocation.city} />
              <Value label="State / Province" value={officeLocation.state} />
              <Value label="Postal code" value={officeLocation.postalCode} />
              <Value label="Country" value={officeLocation.country} />
            </dl>

            <div className="mt-5 border-t border-border pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Description
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground">
                {officeLocation.description || "No description provided."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck aria-hidden="true" className="size-5 text-primary" />
              Record Metadata
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
              <Value label="Office location ID" value={officeLocation.id} />
              <Value label="Status" value={officeLocation.status} />
              <Value
                label="Created"
                value={formatOfficeLocationTimestamp(officeLocation.createdAt)}
              />
              <Value
                label="Last updated"
                value={formatOfficeLocationTimestamp(officeLocation.updatedAt)}
              />
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

