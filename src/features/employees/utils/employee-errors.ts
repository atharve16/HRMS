import type { FieldPath, UseFormSetError } from "react-hook-form";

import type { EmployeeFormValues } from "@/features/employees/schemas/employee-schemas";
import { isApiClientError } from "@/services/api-error";

const backendFieldMap: Record<string, FieldPath<EmployeeFormValues>> = {
  firstName: "firstName",
  lastName: "lastName",
  email: "email",
  phone: "phone",
  dateOfBirth: "dateOfBirth",
  gender: "gender",
  profileImageUrl: "profileImageUrl",
  "address.addressLine1": "addressLine1",
  "address.addressLine2": "addressLine2",
  "address.city": "city",
  "address.state": "state",
  "address.postalCode": "postalCode",
  "address.country": "country",
  designation: "designation",
  departmentId: "departmentId",
  employmentType: "employmentType",
  joiningDate: "joiningDate",
  reportingManagerId: "reportingManagerId",
  workLocation: "workLocation",
  "emergencyContact.name": "emergencyName",
  "emergencyContact.relationship": "emergencyRelationship",
  "emergencyContact.phone": "emergencyPhone",
  terminationDate: "terminationDate",
};

export function applyEmployeeFieldErrors(
  error: unknown,
  setError: UseFormSetError<EmployeeFormValues>,
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

export function getEmployeeErrorMessage(error: unknown) {
  if (!isApiClientError(error)) return "Something went wrong. Please try again.";
  if (!error.status) return "The HRMS service could not be reached. Check your connection and try again.";
  if (error.code === "CONFLICT") return error.message;
  if (error.code === "RESOURCE_NOT_FOUND") return error.message;
  if (error.code === "VALIDATION_ERROR") return "Some employee information is invalid. Review the form and try again.";
  if (error.status >= 500) return "The HRMS service is unavailable right now. Please try again shortly.";
  return error.message;
}

export function isEmployeeNotFoundError(error: unknown) {
  return isApiClientError(error) && error.status === 404;
}
