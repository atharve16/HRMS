import { describe, expect, it, vi } from "vitest";
import type { GeolocationPlugin } from "@capacitor/geolocation";

import {
  captureBrowserLocation,
  captureNativeLocation,
} from "@/features/attendance/hooks/use-geolocation";

describe("captureBrowserLocation utility", () => {
  it("resolves high-accuracy GPS coordinates on success", async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) => {
        success({
          coords: {
            latitude: 12.9715987,
            longitude: 77.5945627,
            accuracy: 14.2,
          },
        });
      }),
    } as unknown as Geolocation;

    const coords = await captureBrowserLocation(mockGeolocation);

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalled();
    expect(coords).toEqual({
      latitude: 12.9715987,
      longitude: 77.5945627,
      accuracyMeters: 14.2,
    });
  });

  it("rejects with user-friendly message when permission is denied", async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((_, error) => {
        error({
          code: 1, // PERMISSION_DENIED
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      }),
    } as unknown as Geolocation;

    await expect(captureBrowserLocation(mockGeolocation)).rejects.toThrow(
      /permission was denied/i,
    );
  });

  it("rejects with user-friendly message on GPS timeout", async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((_, error) => {
        error({
          code: 3, // TIMEOUT
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      }),
    } as unknown as Geolocation;

    await expect(captureBrowserLocation(mockGeolocation)).rejects.toThrow(
      /timed out/i,
    );
  });

  it("rejects when position is unavailable", async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((_, error) => {
        error({
          code: 2, // POSITION_UNAVAILABLE
          PERMISSION_DENIED: 1,
          POSITION_UNAVAILABLE: 2,
          TIMEOUT: 3,
        });
      }),
    } as unknown as Geolocation;

    await expect(captureBrowserLocation(mockGeolocation)).rejects.toThrow(
      /GPS location is unavailable/i,
    );
  });

  it("rejects when geolocation is unsupported", async () => {
    await expect(captureBrowserLocation(undefined)).rejects.toThrow(
      /Geolocation is not supported/i,
    );
  });

  it("rejects a location whose accuracy is not a valid API value", async () => {
    const mockGeolocation = {
      getCurrentPosition: vi.fn().mockImplementation((success) => {
        success({
          coords: {
            latitude: 12.9716,
            longitude: 77.5946,
            accuracy: Number.NaN,
          },
        });
      }),
    } as unknown as Geolocation;

    await expect(captureBrowserLocation(mockGeolocation)).rejects.toThrow(
      /valid GPS accuracy reading/i,
    );
  });
});

describe("captureNativeLocation utility", () => {
  function nativeProvider(
    overrides: Partial<GeolocationPlugin> = {},
  ): GeolocationPlugin {
    return {
      checkPermissions: vi.fn().mockResolvedValue({
        location: "prompt",
        coarseLocation: "prompt",
      }),
      requestPermissions: vi.fn().mockResolvedValue({
        location: "granted",
        coarseLocation: "granted",
      }),
      getCurrentPosition: vi.fn().mockResolvedValue({
        timestamp: Date.now(),
        coords: {
          latitude: 12.9715987,
          longitude: 77.5945627,
          accuracy: 9.4,
        },
      }),
      watchPosition: vi.fn(),
      clearWatch: vi.fn(),
      ...overrides,
    } as unknown as GeolocationPlugin;
  }

  it("requests foreground precise permission and returns native GPS telemetry", async () => {
    const provider = nativeProvider();

    await expect(captureNativeLocation(provider)).resolves.toEqual({
      latitude: 12.9715987,
      longitude: 77.5945627,
      accuracyMeters: 9.4,
    });

    expect(provider.requestPermissions).toHaveBeenCalledWith({
      permissions: ["location"],
    });
    expect(provider.getCurrentPosition).toHaveBeenCalledWith({
      enableHighAccuracy: true,
      timeout: 15_000,
      maximumAge: 0,
      enableLocationFallback: true,
    });
  });

  it("reports denied native permission with a settings route", async () => {
    const provider = nativeProvider({
      requestPermissions: vi.fn().mockResolvedValue({
        location: "denied",
        coarseLocation: "granted",
      }),
    });

    await expect(captureNativeLocation(provider)).rejects.toMatchObject({
      code: "PERMISSION_DENIED",
      canOpenSettings: true,
    });
  });

  it("maps disabled location services to a settings-capable error", async () => {
    const provider = nativeProvider({
      checkPermissions: vi.fn().mockRejectedValue({
        code: "OS-PLUG-GLOC-0007",
      }),
    });

    await expect(captureNativeLocation(provider)).rejects.toMatchObject({
      code: "LOCATION_DISABLED",
      canOpenSettings: true,
    });
  });

  it("maps native timeout and unavailable GPS errors", async () => {
    const timeoutProvider = nativeProvider({
      getCurrentPosition: vi.fn().mockRejectedValue({
        code: "OS-PLUG-GLOC-0010",
      }),
    });
    const unavailableProvider = nativeProvider({
      getCurrentPosition: vi.fn().mockRejectedValue({
        code: "OS-PLUG-GLOC-0002",
      }),
    });

    await expect(captureNativeLocation(timeoutProvider)).rejects.toMatchObject({
      code: "TIMEOUT",
    });
    await expect(captureNativeLocation(unavailableProvider)).rejects.toMatchObject({
      code: "UNAVAILABLE",
    });
  });
});
