import { isApiClientError } from "@/services/api-error";

export function getHolidayErrorMessage(error: unknown): string {
  if (!isApiClientError(error)) {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Something went wrong while processing the holiday request. Please try again.";
  }

  if (!error.status) {
    return "The HRMS service could not be reached. Check your connection and try again.";
  }

  switch (error.code) {
    case "CONFLICT":
      return (
        error.message ||
        "An active company holiday already exists for this date."
      );
    case "RESOURCE_NOT_FOUND":
      return error.message || "Company holiday record was not found.";
    case "VALIDATION_ERROR":
      return (
        error.message ||
        "The submitted holiday information is invalid. Please review and try again."
      );
    default:
      if (error.status >= 500) {
        return "The HRMS holiday service is currently unavailable. Please try again shortly.";
      }
      return error.message;
  }
}

