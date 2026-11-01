import type { DepartmentFormValues } from "@/features/departments/schemas/department-schemas";
import type {
  CreateDepartmentRequest,
  Department,
  UpdateDepartmentRequest,
} from "@/features/departments/types/department-types";

const optional = (value: string) => value.trim() || undefined;

export const emptyDepartmentFormValues: DepartmentFormValues = {
  departmentCode: "",
  name: "",
  description: "",
  managerEmployeeId: "",
};

export function departmentToFormValues(department: Department): DepartmentFormValues {
  return {
    departmentCode: department.departmentCode,
    name: department.name,
    description: department.description ?? "",
    managerEmployeeId: department.managerEmployeeId ?? "",
  };
}

export function toCreateDepartmentRequest(
  values: DepartmentFormValues,
): CreateDepartmentRequest {
  return {
    departmentCode: values.departmentCode.trim().toUpperCase(),
    name: values.name.trim(),
    description: optional(values.description),
    managerEmployeeId: optional(values.managerEmployeeId),
  };
}

export function toUpdateDepartmentRequest(
  values: DepartmentFormValues,
  department: Department,
): UpdateDepartmentRequest {
  const request: UpdateDepartmentRequest = {};
  const code = values.departmentCode.trim().toUpperCase();
  const name = values.name.trim();
  const description = values.description.trim();
  const managerEmployeeId = values.managerEmployeeId.trim();
  if (code !== department.departmentCode) request.departmentCode = code;
  if (name !== department.name) request.name = name;
  if (description !== (department.description ?? "")) request.description = description;
  if (managerEmployeeId !== (department.managerEmployeeId ?? "")) {
    request.managerEmployeeId = managerEmployeeId;
  }
  return request;
}
