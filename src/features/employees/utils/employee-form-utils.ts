import type { EmployeeFormValues } from "@/features/employees/schemas/employee-schemas";
import type {
  CreateEmployeeRequest,
  Employee,
  EmployeeAddress,
  EmergencyContact,
  UpdateEmployeeRequest,
} from "@/features/employees/types/employee-types";

const optional = (value: string) => {
  const normalized = value.trim();
  return normalized || undefined;
};

function addressFromValues(values: EmployeeFormValues): EmployeeAddress | undefined {
  if (!values.addressLine1 && !values.city && !values.state && !values.postalCode && !values.country) {
    return undefined;
  }
  return {
    addressLine1: values.addressLine1.trim(),
    addressLine2: optional(values.addressLine2),
    city: values.city.trim(),
    state: values.state.trim(),
    postalCode: values.postalCode.trim(),
    country: values.country.trim(),
  };
}

function emergencyFromValues(
  values: EmployeeFormValues,
): EmergencyContact | undefined {
  if (!values.emergencyName && !values.emergencyRelationship && !values.emergencyPhone) {
    return undefined;
  }
  return {
    name: values.emergencyName.trim(),
    relationship: values.emergencyRelationship.trim(),
    phone: values.emergencyPhone.trim(),
  };
}

export const emptyEmployeeFormValues: EmployeeFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  profileImageUrl: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  designation: "",
  departmentId: "",
  employmentType: "FULL_TIME",
  joiningDate: "",
  reportingManagerId: "",
  workLocation: "",
  emergencyName: "",
  emergencyRelationship: "",
  emergencyPhone: "",
  terminationDate: "",
};

export function employeeToFormValues(employee: Employee): EmployeeFormValues {
  return {
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    phone: employee.phone ?? "",
    dateOfBirth: employee.dateOfBirth ?? "",
    gender: employee.gender ?? "",
    profileImageUrl: employee.profileImageUrl ?? "",
    addressLine1: employee.address?.addressLine1 ?? "",
    addressLine2: employee.address?.addressLine2 ?? "",
    city: employee.address?.city ?? "",
    state: employee.address?.state ?? "",
    postalCode: employee.address?.postalCode ?? "",
    country: employee.address?.country ?? "",
    designation: employee.designation ?? "",
    departmentId: employee.departmentId ?? "",
    employmentType: employee.employmentType,
    joiningDate: employee.joiningDate,
    reportingManagerId: employee.reportingManagerId ?? "",
    workLocation: employee.workLocation ?? "",
    emergencyName: employee.emergencyContact?.name ?? "",
    emergencyRelationship: employee.emergencyContact?.relationship ?? "",
    emergencyPhone: employee.emergencyContact?.phone ?? "",
    terminationDate: employee.terminationDate ?? "",
  };
}

export function toCreateEmployeeRequest(
  values: EmployeeFormValues,
): CreateEmployeeRequest {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName.trim(),
    email: values.email.trim().toLowerCase(),
    employmentType: values.employmentType,
    joiningDate: values.joiningDate,
    phone: optional(values.phone),
    dateOfBirth: optional(values.dateOfBirth),
    gender: values.gender || undefined,
    profileImageUrl: optional(values.profileImageUrl),
    address: addressFromValues(values),
    designation: optional(values.designation),
    departmentId: optional(values.departmentId),
    reportingManagerId: optional(values.reportingManagerId),
    workLocation: optional(values.workLocation),
    emergencyContact: emergencyFromValues(values),
  };
}

function changed<T>(next: T, current: T) {
  return JSON.stringify(next) !== JSON.stringify(current);
}

export function toUpdateEmployeeRequest(
  values: EmployeeFormValues,
  employee: Employee,
): UpdateEmployeeRequest {
  const request: UpdateEmployeeRequest = {};
  const firstName = values.firstName.trim();
  const lastName = values.lastName.trim();
  const email = values.email.trim().toLowerCase();
  const stringFields = [
    ["phone", values.phone.trim(), employee.phone ?? ""],
    ["profileImageUrl", values.profileImageUrl.trim(), employee.profileImageUrl ?? ""],
    ["designation", values.designation.trim(), employee.designation ?? ""],
    ["departmentId", values.departmentId.trim(), employee.departmentId ?? ""],
    ["reportingManagerId", values.reportingManagerId.trim(), employee.reportingManagerId ?? ""],
    ["workLocation", values.workLocation.trim(), employee.workLocation ?? ""],
  ] as const;

  if (firstName !== employee.firstName) request.firstName = firstName;
  if (lastName !== employee.lastName) request.lastName = lastName;
  if (email !== employee.email) request.email = email;
  stringFields.forEach(([field, next, current]) => {
    if (next !== current) request[field] = next;
  });
  if (values.dateOfBirth && values.dateOfBirth !== employee.dateOfBirth) {
    request.dateOfBirth = values.dateOfBirth;
  }
  if (values.gender && values.gender !== employee.gender) request.gender = values.gender;
  if (values.employmentType !== employee.employmentType) {
    request.employmentType = values.employmentType;
  }
  if (values.terminationDate && values.terminationDate !== employee.terminationDate) {
    request.terminationDate = values.terminationDate;
  }

  const nextAddress = addressFromValues(values);
  if (nextAddress && changed(nextAddress, employee.address)) request.address = nextAddress;
  const nextEmergency = emergencyFromValues(values);
  if (nextEmergency && changed(nextEmergency, employee.emergencyContact)) {
    request.emergencyContact = nextEmergency;
  }

  return request;
}
