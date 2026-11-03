"use client";

import { useCallback, useState } from "react";

import type { GpsRequest } from "@/features/attendance/types/attendance-types";

export interface GeolocationState {
  location: GpsRequest | null;
  error: string | null;
  isCapturing: boolean;
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
        const gps: GpsRequest = {
          latitude: Number(position.coords.latitude.toFixed(7)),
          longitude: Number(position.coords.longitude.toFixed(7)),
          accuracyMeters: Math.round(position.coords.accuracy * 10) / 10,
        };
        resolve(gps);
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

export function useGeolocation(geolocationProvider?: Geolocation) {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    isCapturing: false,
  });

  const captureLocation = useCallback(async (): Promise<GpsRequest> => {
    setState((prev) => ({ ...prev, isCapturing: true, error: null }));
    try {
      const gps = await captureBrowserLocation(geolocationProvider);
      setState({
        location: gps,
        error: null,
        isCapturing: false,
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
      });
      throw err;
    }
  }, [geolocationProvider]);

  const resetLocation = useCallback(() => {
    setState({
      location: null,
      error: null,
      isCapturing: false,
    });
  }, []);

  return {
    ...state,
    captureLocation,
    resetLocation,
  };
}
