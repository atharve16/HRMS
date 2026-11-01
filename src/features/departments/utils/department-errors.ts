import type { FieldPath, UseFormSetError } from "react-hook-form";

import type { DepartmentFormValues } from "@/features/departments/schemas/department-schemas";
import { isApiClientError } from "@/services/api-error";

const backendFieldMap: Record<string, FieldPath<DepartmentFormValues>> = {
  departmentCode: "departmentCode",
  name: "name",
  description: "description",
  managerEmployeeId: "managerEmployeeId",
};

export function applyDepartmentFieldErrors(
  error: unknown,
  setError: UseFormSetError<DepartmentFormValues>,
) {
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

export function getDepartmentErrorMessage(error: unknown) {
  if (!isApiClientError(error)) return "Something went wrong. Please try again.";
  if (!error.status) return "The HRMS service could not be reached. Check your connection and try again.";
  if (error.code === "CONFLICT") return error.message;
  if (error.code === "RESOURCE_NOT_FOUND") return error.message;
  if (error.code === "VALIDATION_ERROR") return "Some department information is invalid. Review the form and try again.";
  if (error.status >= 500) return "The HRMS service is unavailable right now. Please try again shortly.";
  return error.message;
}

export function isDepartmentNotFoundError(error: unknown) {
  return isApiClientError(error) && error.status === 404;
}
