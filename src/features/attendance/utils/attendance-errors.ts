import { isApiClientError } from "@/services/api-error";

export function getAttendanceErrorMessage(error: unknown): string {
  if (!isApiClientError(error)) {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Something went wrong while processing attendance. Please try again.";
  }

  if (!error.status) {
    return "The HRMS service could not be reached. Check your connection and try again.";
  }

  switch (error.code) {
    case "OUTSIDE_GEOFENCE":
      return "You are outside your assigned office geofence. Check-in and check-out must occur within your office location perimeter.";
    case "GPS_ACCURACY_TOO_LOW":
      return "Your device GPS accuracy is too low for geofence verification. Please move to an open area with a better signal and try again.";
    case "NO_WORK_ASSIGNMENT":
      return (
        error.message ||
        "No valid work assignment or attendance window applies right now. Check with your HR administrator."
      );
    case "NO_ACTIVE_CHECK_IN":
      return "No active attendance session was found. You must check in before checking out.";
    case "INVALID_ATTENDANCE_TRANSITION":
      return error.message || "Invalid attendance session transition.";
    case "INVALID_ATTENDANCE_CORRECTION":
      return (
        error.message ||
        "The proposed correction creates invalid session timestamps."
      );
    case "CONFLICT":
      return error.message;
    case "RESOURCE_NOT_FOUND":
      return error.message || "Attendance record was not found.";
    case "VALIDATION_ERROR":
      return (
        error.message ||
        "Some attendance information is invalid. Please review and try again."
      );
    default:
      if (error.status >= 500) {
        return "The HRMS attendance service is currently unavailable. Please try again shortly.";
      }
      return error.message;
  }
}

export function isOutsideGeofenceError(error: unknown): boolean {
  return isApiClientError(error) && error.code === "OUTSIDE_GEOFENCE";
}

export function isGpsAccuracyError(error: unknown): boolean {
  return isApiClientError(error) && error.code === "GPS_ACCURACY_TOO_LOW";
}

