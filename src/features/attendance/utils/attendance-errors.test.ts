import { describe, expect, it } from "vitest";

import {
  getAttendanceErrorMessage,
  isGpsAccuracyError,
  isOutsideGeofenceError,
} from "@/features/attendance/utils/attendance-errors";
import { ApiClientError } from "@/services/api-error";

describe("attendance error utilities", () => {
  it("translates OUTSIDE_GEOFENCE errors into helpful user copy", () => {
    const error = new ApiClientError("Outside geofence", {
      status: 403,
      code: "OUTSIDE_GEOFENCE",
    });
    expect(getAttendanceErrorMessage(error)).toContain("outside your assigned office geofence");
    expect(isOutsideGeofenceError(error)).toBe(true);
    expect(isGpsAccuracyError(error)).toBe(false);
  });

  it("translates GPS_ACCURACY_TOO_LOW errors", () => {
    const error = new ApiClientError("GPS accuracy too low", {
      status: 400,
      code: "GPS_ACCURACY_TOO_LOW",
    });
    expect(getAttendanceErrorMessage(error)).toContain("device GPS accuracy is too low");
    expect(isGpsAccuracyError(error)).toBe(true);
  });

  it("handles offline network connection failure", () => {
    const error = new ApiClientError("Network Error", { status: 0 });
    expect(getAttendanceErrorMessage(error)).toContain("The HRMS service could not be reached");
  });

  it("preserves backend conflict message", () => {
    const error = new ApiClientError("An attendance session is already active", {
      status: 409,
      code: "CONFLICT",
    });
    expect(getAttendanceErrorMessage(error)).toBe("An attendance session is already active");
  });
});

