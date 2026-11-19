"use client";

import { AppLauncher } from "@capacitor/app-launcher";
import { Capacitor } from "@capacitor/core";
import { Geolocation, type GeolocationPlugin } from "@capacitor/geolocation";
import { useCallback, useState } from "react";

import type { GpsRequest } from "@/features/attendance/types/attendance-types";

export interface GeolocationState {
  location: GpsRequest | null;
  error: string | null;
  isCapturing: boolean;
  settingsRequired: boolean;
}

export type LocationCaptureCode =
  | "PERMISSION_DENIED"
  | "LOCATION_DISABLED"
  | "TIMEOUT"
  | "UNAVAILABLE";

export class LocationCaptureError extends Error {
  readonly code: LocationCaptureCode;
  readonly canOpenSettings: boolean;

  constructor(
    code: LocationCaptureCode,
    message: string,
    canOpenSettings = false,
  ) {
    super(message);
    this.name = "LocationCaptureError";
    this.code = code;
    this.canOpenSettings = canOpenSettings;
  }
}

function gpsFromCoordinates(coords: {
  latitude: number;
  longitude: number;
  accuracy: number;
}): GpsRequest {
  const gps: GpsRequest = {
    latitude: Number(coords.latitude.toFixed(7)),
    longitude: Number(coords.longitude.toFixed(7)),
    accuracyMeters: Math.round(coords.accuracy * 10) / 10,
  };

  // Some browsers/WebViews can return a location with a non-finite accuracy
  // value. JSON serializes NaN/Infinity as null, which then fails the server
  // DTO validation even though coordinates render.
  if (
    !Number.isFinite(gps.latitude) ||
    !Number.isFinite(gps.longitude) ||
    !Number.isFinite(gps.accuracyMeters) ||
    gps.latitude < -90 ||
    gps.latitude > 90 ||
    gps.longitude < -180 ||
    gps.longitude > 180 ||
    gps.accuracyMeters <= 0 ||
    gps.accuracyMeters > 1000
  ) {
    throw new Error(
      "Your device did not return a valid GPS accuracy reading. Please enable precise location and try again.",
    );
  }

  return gps;
}

function nativeErrorCode(error: unknown) {
  if (!error || typeof error !== "object") return "";
  const code = (error as { code?: unknown }).code;
  return typeof code === "string" ? code.toUpperCase() : "";
}

function nativeLocationError(error: unknown): LocationCaptureError {
  const code = nativeErrorCode(error);

  if (code === "OS-PLUG-GLOC-0003" || code === "OS-PLUG-GLOC-0009") {
    return new LocationCaptureError(
      "PERMISSION_DENIED",
      "Location permission is denied. Open Android Settings, select HRMS, then allow Precise location under Permissions.",
      true,
    );
  }

  if (
    code === "OS-PLUG-GLOC-0007" ||
    code === "OS-PLUG-GLOC-0016" ||
    code === "OS-PLUG-GLOC-0017"
  ) {
    return new LocationCaptureError(
      "LOCATION_DISABLED",
      "Android Location services are turned off. Turn on Location services and try again.",
      true,
    );
  }

  if (code === "OS-PLUG-GLOC-0010" || code === "OS-PLUG-GLOC-0011") {
    return new LocationCaptureError(
      "TIMEOUT",
      "Location request timed out. Please try again with a clear GPS signal or network connection.",
    );
  }

  return new LocationCaptureError(
    "UNAVAILABLE",
    "GPS location is unavailable. Check that Location services are enabled and try again outdoors or near a window.",
  );
}

export function captureBrowserLocation(
  geolocationProvider?: Geolocation,
): Promise<GpsRequest> {
  return new Promise((resolve, reject) => {
    const geo =
      geolocationProvider ??
      (typeof window !== "undefined" && typeof navigator !== "undefined"
        ? navigator.geolocation
        : undefined);

    if (!geo) {
      reject(
        new Error(
          "Geolocation is not supported by your browser or environment.",
        ),
      );
      return;
    }

    geo.getCurrentPosition(
      (position) => {
        try {
          resolve(gpsFromCoordinates(position.coords));
        } catch (error) {
          reject(error);
        }
      },
      (error) => {
        let errorMsg = "Unable to retrieve your current location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg =
              "Location permission was denied. Please grant location access in your browser to verify attendance geofencing.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg =
              "GPS location is unavailable. Check that location services are enabled on your device.";
            break;
          case error.TIMEOUT:
            errorMsg =
              "Location request timed out. Please try again with a clear GPS signal or network connection.";
            break;
        }
        reject(new Error(errorMsg));
      },
      {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 0,
      },
    );
  });
}

export async function captureNativeLocation(
  geolocationProvider: GeolocationPlugin = Geolocation,
): Promise<GpsRequest> {
  let permissions;
  try {
    permissions = await geolocationProvider.checkPermissions();
  } catch (error) {
    throw nativeLocationError(error);
  }

  // The location alias checks both coarse and fine permissions on Android.
  // Requesting it is foreground-only; this code never starts a watch.
  if (permissions.location !== "granted") {
    try {
      permissions = await geolocationProvider.requestPermissions({
        permissions: ["location"],
      });
    } catch (error) {
      throw nativeLocationError(error);
    }
  }

  if (permissions.location !== "granted") {
    throw new LocationCaptureError(
      "PERMISSION_DENIED",
      "Location permission is denied. Open Android Settings, select HRMS, then allow Precise location under Permissions.",
      true,
    );
  }

  try {
    const position = await geolocationProvider.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15_000,
      maximumAge: 0,
      enableLocationFallback: true,
    });
    return gpsFromCoordinates(position.coords);
  } catch (error) {
    throw nativeLocationError(error);
  }
}

export function isLocationSettingsError(error: unknown): error is LocationCaptureError {
  return error instanceof LocationCaptureError && error.canOpenSettings;
}

export async function openNativeLocationSettings() {
  if (Capacitor.getPlatform() !== "android") return false;

  try {
    const result = await AppLauncher.openUrl({ url: "com.android.settings" });
    return result.completed;
  } catch {
    return false;
  }
}

export function useGeolocation(geolocationProvider?: Geolocation) {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isCapturing: false,
    settingsRequired: false,
  });

  const captureLocation = useCallback(async (): Promise<GpsRequest> => {
    setState((prev) => ({
      ...prev,
      isCapturing: true,
      error: null,
      settingsRequired: false,
    }));
    try {
      const gps = Capacitor.isNativePlatform()
        ? await captureNativeLocation()
        : await captureBrowserLocation(geolocationProvider);
      setState({
        location: gps,
        error: null,
        isCapturing: false,
        settingsRequired: false,
      });
      return gps;
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Unable to retrieve your current location.";
      setState({
        location: null,
        error: msg,
        isCapturing: false,
        settingsRequired: isLocationSettingsError(err),
      });
      throw err;
    }
  }, [geolocationProvider]);

  const resetLocation = useCallback(() => {
    setState({
      location: null,
      error: null,
      isCapturing: false,
      settingsRequired: false,
    });
  }, []);

  const openSettings = useCallback(() => openNativeLocationSettings(), []);

  return {
    ...state,
    captureLocation,
    resetLocation,
    openSettings,
  };
}
