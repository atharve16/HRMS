import { isApiClientError } from "@/services/api-error";

export function getLeaveErrorMessage(error: unknown): string {
  if (!isApiClientError(error)) {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Something went wrong while processing the leave request. Please try again.";
  }

  if (!error.status) {
    return "The HRMS service could not be reached. Check your connection and try again.";
  }

  switch (error.code) {
    case "OVERLAPPING_LEAVE":
      return (
        error.message ||
        "A pending or approved leave request overlaps with the selected date range."
      );
    case "INSUFFICIENT_LEAVE_BALANCE":
      return (
        error.message ||
        "Insufficient leave balance for the requested leave type."
      );
    case "NO_WORK_ASSIGNMENT":
      return (
        error.message ||
        "No valid work assignment exists for the requested dates."
      );
    case "CONFLICT":
      return (
        error.message ||
        "The leave request conflicts with an existing operation or policy."
      );
    case "RESOURCE_NOT_FOUND":
      return error.message || "The requested leave record was not found.";
    case "VALIDATION_ERROR":
      return (
        error.message ||
        "The submitted leave information is invalid. Please review and try again."
      );
    default:
      if (error.status >= 500) {
        return "The HRMS leave service is currently unavailable. Please try again shortly.";
      }
      return error.message;
  }
}

