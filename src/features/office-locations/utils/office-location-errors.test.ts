import { describe, expect, it, vi } from "vitest";

import {
  applyOfficeLocationFieldErrors,
  getOfficeLocationErrorMessage,
  isOfficeLocationNotFoundError,
} from "@/features/office-locations/utils/office-location-errors";
import { ApiClientError } from "@/services/api-error";

describe("office location error handling", () => {
  it("applies server validation details to react-hook-form", () => {
    const setError = vi.fn();
    const error = new ApiClientError("Validation failed", {
      status: 400,
      code: "VALIDATION_ERROR",
      details: {
        locationCode: "Location code already exists",
        latitude: "Latitude must be between -90 and 90",
        "coordinates.longitude": "Longitude is required",
      },
    });

    const applied = applyOfficeLocationFieldErrors(error, setError);
    expect(applied).toBe(true);
    expect(setError).toHaveBeenCalledWith("locationCode", {
      type: "server",
      message: "Location code already exists",
    });
    expect(setError).toHaveBeenCalledWith("latitude", {
      type: "server",
      message: "Latitude must be between -90 and 90",
    });
    expect(setError).toHaveBeenCalledWith("longitude", {
      type: "server",
      message: "Longitude is required",
    });
  });

  it("maps conflict, not found, network, and server errors to user messages", () => {
    expect(
      getOfficeLocationErrorMessage(
        new ApiClientError("Location code already exists", {
          status: 409,
          code: "CONFLICT",
        }),
      ),
    ).toBe("Location code already exists");

    expect(
      getOfficeLocationErrorMessage(
        new ApiClientError("Office location was not found", {
          status: 404,
          code: "RESOURCE_NOT_FOUND",
        }),
      ),
    ).toBe("Office location was not found");

    expect(
      getOfficeLocationErrorMessage(
        new ApiClientError("Network error", {
          status: 0,
          code: "NETWORK_ERROR",
        }),
      ),
    ).toContain("could not be reached");

    expect(
      getOfficeLocationErrorMessage(
        new ApiClientError("Validation error", {
          status: 400,
          code: "VALIDATION_ERROR",
        }),
      ),
    ).toContain("information is invalid");

    expect(
      getOfficeLocationErrorMessage(
        new ApiClientError("Server failure", {
          status: 500,
          code: "SERVER_ERROR",
        }),
      ),
    ).toContain("unavailable right now");
  });

  it("identifies not found errors", () => {
    expect(
      isOfficeLocationNotFoundError(
        new ApiClientError("Not found", { status: 404, code: "NOT_FOUND" }),
      ),
    ).toBe(true);
    expect(
      isOfficeLocationNotFoundError(
        new ApiClientError("Conflict", { status: 409, code: "CONFLICT" }),
      ),
    ).toBe(false);
  });
});

