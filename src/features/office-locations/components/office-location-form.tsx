"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Compass,
  Info,
  LoaderCircle,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useForm, useWatch, type FieldError } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateOfficeLocation } from "@/features/office-locations/hooks/use-create-office-location";
import { useUpdateOfficeLocation } from "@/features/office-locations/hooks/use-update-office-location";
import {
  officeLocationFormSchema,
  type OfficeLocationFormValues,
} from "@/features/office-locations/schemas/office-location-schemas";
import type { OfficeLocation } from "@/features/office-locations/types/office-location-types";
import {
  isValidCoordinatePair,
  toGeoJsonPoint,
} from "@/features/office-locations/utils/geo-utils";
import {
  applyOfficeLocationFieldErrors,
  getOfficeLocationErrorMessage,
} from "@/features/office-locations/utils/office-location-errors";
import {
  emptyOfficeLocationFormValues,
  officeLocationToFormValues,
  toCreateOfficeLocationRequest,
  toUpdateOfficeLocationRequest,
} from "@/features/office-locations/utils/office-location-form-utils";
import { cn } from "@/lib/utils";

function FormField({
  children,
  error,
  hint,
  htmlFor,
  label,
}: {
  children: ReactNode;
  error?: FieldError;
  hint?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" id={`${htmlFor}-error`} role="alert">
          {error.message}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground" id={`${htmlFor}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function OfficeLocationForm({
  mode,
  officeLocation,
}: {
  mode: "create" | "edit";
  officeLocation?: OfficeLocation;
}) {
  const router = useRouter();
  const createMutation = useCreateOfficeLocation();
  const updateMutation = useUpdateOfficeLocation();
  const [formMessage, setFormMessage] = useState<string | null>(null);

  // Browser geolocation state
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoNotice, setGeoNotice] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const form = useForm<OfficeLocationFormValues>({
    resolver: zodResolver(officeLocationFormSchema),
    defaultValues: officeLocation
      ? officeLocationToFormValues(officeLocation)
      : emptyOfficeLocationFormValues,
  });

  const mutation = mode === "create" ? createMutation : updateMutation;

  // Watch coordinates for live GeoJSON preview
  const watchedLat = useWatch({ control: form.control, name: "latitude" });
  const watchedLon = useWatch({ control: form.control, name: "longitude" });
  const numLat = Number(watchedLat);
  const numLon = Number(watchedLon);
  const hasValidCoordinates =
    watchedLat &&
    watchedLon &&
    !Number.isNaN(numLat) &&
    !Number.isNaN(numLon) &&
    isValidCoordinatePair(numLat, numLon);

  function requestBrowserCoordinates() {
    setGeoNotice(null);
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setGeoNotice({
        type: "error",
        message:
          "Geolocation is not supported by your browser. Please enter coordinates manually.",
      });
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoading(false);
        const lat = position.coords.latitude.toFixed(6);
        const lon = position.coords.longitude.toFixed(6);
        form.setValue("latitude", lat, { shouldValidate: true, shouldDirty: true });
        form.setValue("longitude", lon, { shouldValidate: true, shouldDirty: true });
        const accuracy = Math.round(position.coords.accuracy);
        setGeoNotice({
          type: "success",
          message: `Device coordinates retrieved (${lat}, ${lon}) with ±${accuracy}m accuracy. Please verify they accurately represent your office entrance before saving.`,
        });
      },
      (error) => {
        setGeoLoading(false);
        let message = "Unable to retrieve device location.";
        if (error.code === error.PERMISSION_DENIED) {
          message =
            "Location access was denied. Allow location permissions in your browser or enter coordinates manually.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message =
            "Location information is unavailable from your device. Please enter coordinates manually.";
        } else if (error.code === error.TIMEOUT) {
          message =
            "Request to retrieve location timed out. Please try again or enter coordinates manually.";
        }
        setGeoNotice({ type: "error", message });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }

  async function submit(values: OfficeLocationFormValues) {
    mutation.reset();
    setFormMessage(null);
    try {
      if (mode === "create") {
        const created = await createMutation.mutateAsync(
          toCreateOfficeLocationRequest(values),
        );
        router.push(`/admin/office-locations/${created.id}?created=1`);
        return;
      }
      if (!officeLocation) return;
      const request = toUpdateOfficeLocationRequest(values, officeLocation);
      if (Object.keys(request).length === 0) {
        setFormMessage("No supported office location fields have changed.");
        return;
      }
      const updated = await updateMutation.mutateAsync({
        officeLocationId: officeLocation.id,
        request,
      });
      router.push(`/admin/office-locations/${updated.id}?updated=1`);
    } catch (error) {
      applyOfficeLocationFieldErrors(error, form.setError);
    }
  }

  return (
    <form className="space-y-6" noValidate onSubmit={form.handleSubmit(submit)}>
      <fieldset disabled={mutation.isPending}>
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Identify this office location with a unique uppercase code and descriptive name.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <FormField
              error={form.formState.errors.locationCode}
              hint="2-20 letters, numbers, underscores, or hyphens. Saved in uppercase."
              htmlFor="locationCode"
              label="Location code"
            >
              <Input
                {...form.register("locationCode")}
                aria-describedby={
                  form.formState.errors.locationCode
                    ? "locationCode-error"
                    : "locationCode-hint"
                }
                aria-invalid={Boolean(form.formState.errors.locationCode)}
                className="uppercase"
                id="locationCode"
                placeholder="HQ-01"
              />
            </FormField>

            <FormField
              error={form.formState.errors.name}
              hint="Descriptive name (up to 120 characters)."
              htmlFor="name"
              label="Location name"
            >
              <Input
                {...form.register("name")}
                aria-invalid={Boolean(form.formState.errors.name)}
                id="name"
                placeholder="Headquarters Office"
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField
                error={form.formState.errors.description}
                hint="Optional notes or details (up to 1,000 characters)."
                htmlFor="description"
                label="Description"
              >
                <Textarea
                  {...form.register("description")}
                  aria-describedby={
                    form.formState.errors.description
                      ? "description-error"
                      : "description-hint"
                  }
                  aria-invalid={Boolean(form.formState.errors.description)}
                  id="description"
                  placeholder="Describe this workplace, entry requirements, or building details."
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Physical Address</CardTitle>
            <CardDescription>
              Provide the postal and municipal address of the office facility.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <FormField
                error={form.formState.errors.addressLine1}
                htmlFor="addressLine1"
                label="Address line 1"
              >
                <Input
                  {...form.register("addressLine1")}
                  aria-invalid={Boolean(form.formState.errors.addressLine1)}
                  id="addressLine1"
                  placeholder="100 Main Street"
                />
              </FormField>
            </div>

            <div className="sm:col-span-2">
              <FormField
                error={form.formState.errors.addressLine2}
                hint="Optional suite, floor, or unit number."
                htmlFor="addressLine2"
                label="Address line 2"
              >
                <Input
                  {...form.register("addressLine2")}
                  id="addressLine2"
                  placeholder="Floor 4, Suite 400"
                />
              </FormField>
            </div>

            <FormField
              error={form.formState.errors.city}
              htmlFor="city"
              label="City"
            >
              <Input
                {...form.register("city")}
                aria-invalid={Boolean(form.formState.errors.city)}
                id="city"
                placeholder="San Francisco"
              />
            </FormField>

            <FormField
              error={form.formState.errors.state}
              htmlFor="state"
              label="State / Province"
            >
              <Input
                {...form.register("state")}
                aria-invalid={Boolean(form.formState.errors.state)}
                id="state"
                placeholder="CA"
              />
            </FormField>

            <FormField
              error={form.formState.errors.postalCode}
              htmlFor="postalCode"
              label="Postal code"
            >
              <Input
                {...form.register("postalCode")}
                aria-invalid={Boolean(form.formState.errors.postalCode)}
                id="postalCode"
                placeholder="94105"
              />
            </FormField>

            <FormField
              error={form.formState.errors.country}
              htmlFor="country"
              label="Country"
            >
              <Input
                {...form.register("country")}
                aria-invalid={Boolean(form.formState.errors.country)}
                id="country"
                placeholder="USA"
              />
            </FormField>
          </CardContent>
        </Card>

        {/* Geographic Coordinates & Geofencing */}
        <Card className="mt-6">
          <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Coordinates & Geofencing</CardTitle>
              <CardDescription>
                GPS center coordinates and boundary radius for employee attendance validation.
              </CardDescription>
            </div>
            <Button
              disabled={mutation.isPending || geoLoading}
              onClick={requestBrowserCoordinates}
              type="button"
              variant="outline"
            >
              {geoLoading ? (
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              ) : (
                <Compass aria-hidden="true" className="size-4" />
              )}
              {geoLoading ? "Detecting location..." : "Use device GPS"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            {geoNotice && (
              <div
                className={cn(
                  "flex gap-3 rounded-lg border p-3.5 text-xs",
                  geoNotice.type === "success"
                    ? "border-success/30 bg-success-soft text-success"
                    : "border-destructive/30 bg-destructive-soft text-destructive",
                )}
                role="status"
              >
                {geoNotice.type === "success" ? (
                  <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />
                ) : (
                  <AlertCircle aria-hidden="true" className="size-4 shrink-0" />
                )}
                <span>{geoNotice.message}</span>
              </div>
            )}

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                error={form.formState.errors.latitude}
                hint="Decimal degrees between -90.0 and 90.0."
                htmlFor="latitude"
                label="Latitude"
              >
                <Input
                  {...form.register("latitude")}
                  aria-describedby={
                    form.formState.errors.latitude
                      ? "latitude-error"
                      : "latitude-hint"
                  }
                  aria-invalid={Boolean(form.formState.errors.latitude)}
                  id="latitude"
                  placeholder="37.774900"
                  step="any"
                  type="text"
                />
              </FormField>

              <FormField
                error={form.formState.errors.longitude}
                hint="Decimal degrees between -180.0 and 180.0."
                htmlFor="longitude"
                label="Longitude"
              >
                <Input
                  {...form.register("longitude")}
                  aria-describedby={
                    form.formState.errors.longitude
                      ? "longitude-error"
                      : "longitude-hint"
                  }
                  aria-invalid={Boolean(form.formState.errors.longitude)}
                  id="longitude"
                  placeholder="-122.419400"
                  step="any"
                  type="text"
                />
              </FormField>
            </div>

            {/* GeoJSON specification notice and preview */}
            <div className="rounded-lg border border-border bg-muted/40 p-3.5 text-xs text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <Info aria-hidden="true" className="size-4 text-primary" />
                GeoJSON coordinate ordering: [longitude, latitude]
              </div>
              <p className="mt-1">
                The backend stores office coordinates in GeoJSON format where the first element is longitude and the second is latitude.
              </p>
              {hasValidCoordinates && (
                <div className="mt-2.5 font-mono text-foreground">
                  Backend GeoJSON:{" "}
                  <span className="rounded bg-muted px-1.5 py-0.5 font-semibold text-primary">
                    {JSON.stringify(toGeoJsonPoint(numLat, numLon))}
                  </span>
                </div>
              )}
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                error={form.formState.errors.geofenceRadiusMeters}
                hint="Meters (1 to 10,000). Default is 100 meters."
                htmlFor="geofenceRadiusMeters"
                label="Geofence radius (meters)"
              >
                <Input
                  {...form.register("geofenceRadiusMeters")}
                  aria-describedby={
                    form.formState.errors.geofenceRadiusMeters
                      ? "geofenceRadiusMeters-error"
                      : "geofenceRadiusMeters-hint"
                  }
                  aria-invalid={Boolean(
                    form.formState.errors.geofenceRadiusMeters,
                  )}
                  id="geofenceRadiusMeters"
                  placeholder="100"
                  step="any"
                  type="number"
                />
              </FormField>

              <FormField
                error={form.formState.errors.maximumGpsAccuracyMeters}
                hint="Meters (1 to 1,000). Default is 50 meters."
                htmlFor="maximumGpsAccuracyMeters"
                label="Maximum GPS accuracy (meters)"
              >
                <Input
                  {...form.register("maximumGpsAccuracyMeters")}
                  aria-describedby={
                    form.formState.errors.maximumGpsAccuracyMeters
                      ? "maximumGpsAccuracyMeters-error"
                      : "maximumGpsAccuracyMeters-hint"
                  }
                  aria-invalid={Boolean(
                    form.formState.errors.maximumGpsAccuracyMeters,
                  )}
                  id="maximumGpsAccuracyMeters"
                  placeholder="50"
                  step="any"
                  type="number"
                />
              </FormField>
            </div>
          </CardContent>
        </Card>
      </fieldset>

      {formMessage && (
        <div
          className="rounded-lg border border-info/20 bg-info-soft p-3 text-sm text-info"
          role="status"
        >
          {formMessage}
        </div>
      )}

      {mutation.error && (
        <div
          className="flex gap-2 rounded-lg border border-destructive/20 bg-destructive-soft p-3 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {getOfficeLocationErrorMessage(mutation.error)}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <Link
          className={cn(buttonVariants({ variant: "outline" }), "sm:min-w-28")}
          href={
            officeLocation
              ? `/admin/office-locations/${officeLocation.id}`
              : "/admin/office-locations"
          }
        >
          Cancel
        </Link>
        <Button
          className="sm:min-w-44"
          disabled={mutation.isPending}
          type="submit"
        >
          {mutation.isPending ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="size-4" />
          )}
          {mutation.isPending
            ? "Saving..."
            : mode === "create"
              ? "Create office location"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
