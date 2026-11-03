import { describe, expect, it, vi } from "vitest";

import { captureBrowserLocation } from "@/features/attendance/hooks/use-geolocation";

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
});
