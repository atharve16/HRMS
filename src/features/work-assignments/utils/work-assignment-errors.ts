import type { FieldPath, UseFormSetError } from "react-hook-form";

import type { CreateAssignmentFormValues } from "@/features/work-assignments/schemas/work-assignment-schemas";
import { isApiClientError } from "@/services/api-error";

const backendFieldMap: Record<string, FieldPath<CreateAssignmentFormValues>> = {
  shiftId: "shiftId",
  officeLocationId: "officeLocationId",
  effectiveFrom: "effectiveFrom",
  effectiveTo: "effectiveTo",
  reason: "reason",
};

export function applyWorkAssignmentFieldErrors(
  error: unknown,
  setError: UseFormSetError<CreateAssignmentFormValues>,
): boolean {
  if (!isApiClientError(error)) return false;
  let applied = false;
  Object.entries(error.details).forEach(([field, message]) => {
    const formField = backendFieldMap[field];
    if (formField) {
      setError(formField, { type: "server", message });
      applied = true;
    }
  });
  return applied;
}

export function getWorkAssignmentErrorMessage(error: unknown): string {
  if (!isApiClientError(error)) {
    return "Something went wrong. Please try again.";
  }
  if (!error.status) {
    return "The HRMS service could not be reached. Check your connection and try again.";
  }
  if (error.code === "CONFLICT") {
    return error.message;
  }
  if (error.code === "RESOURCE_NOT_FOUND") {
    return error.message;
  }
  if (error.code === "VALIDATION_ERROR") {
    return error.message || "Some assignment information is invalid. Review the inputs and try again.";
  }
  if (error.status >= 500) {
    return "The HRMS service is unavailable right now. Please try again shortly.";
  }
  return error.message;
}

export function isWorkAssignmentNotFoundError(error: unknown): boolean {
  return isApiClientError(error) && error.status === 404;
}

export function isWorkAssignmentConflictError(error: unknown): boolean {
  return isApiClientError(error) && (error.status === 409 || error.code === "CONFLICT");
}

