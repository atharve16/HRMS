import { isApiClientError } from "@/services/api-error";

export function getPayrollErrorMessage(error: unknown): string {
  if (!isApiClientError(error)) {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return "Something went wrong while processing the payroll request. Please try again.";
  }

  if (!error.status) {
    return "The HRMS service could not be reached. Check your connection and try again.";
  }

  switch (error.code) {
    case "PAYROLL_ALREADY_EXISTS":
      return (
        error.message ||
        "A payroll record already exists for the selected employee, month, and year."
      );
    case "PAYROLL_NOT_DRAFT":
      return (
        error.message ||
        "Adjustments can only be updated when the payroll record is in DRAFT status."
      );
    case "PAYROLL_NOT_REVIEWABLE":
      return (
        error.message ||
        "Only draft payroll records can be submitted for review."
      );
    case "PAYROLL_NOT_FINALIZABLE":
      return (
        error.message ||
        "Only reviewed payroll records can be finalized."
      );
    case "PAYROLL_NOT_PAYABLE":
      return (
        error.message ||
        "Only finalized payroll records can be marked as paid."
      );
    case "PAYROLL_NEGATIVE_NET":
    case "PAYROLL_INVALID_ADJUSTMENT":
      return (
        error.message ||
        "Salary adjustments would produce an invalid or negative net salary."
      );
    case "SALARY_STRUCTURE_NOT_FOUND":
      return (
        error.message ||
        "No active salary structure found for this employee. Please configure salary first."
      );
    case "SALARY_STRUCTURE_INVALID_DATE":
      return (
        error.message ||
        "Salary structure effective date cannot be earlier than joining date or current structure."
      );
    case "CONFLICT":
      return (
        error.message ||
        "The payroll action conflicts with existing records or policies."
      );
    case "RESOURCE_NOT_FOUND":
      return error.message || "The requested payroll record was not found.";
    case "VALIDATION_ERROR":
      return (
        error.message ||
        "The submitted payroll data is invalid. Please review and try again."
      );
    default:
      if (error.status >= 500) {
        return "The HRMS payroll service is currently unavailable. Please try again shortly.";
      }
      return (
        error.message ||
        "An unexpected error occurred while processing the payroll request."
      );
  }
}

