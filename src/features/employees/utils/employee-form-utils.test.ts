import { describe, expect, it } from "vitest";

import type { Employee } from "@/features/employees/types/employee-types";
import {
  employeeToFormValues,
  toCreateEmployeeRequest,
  toUpdateEmployeeRequest,
} from "@/features/employees/utils/employee-form-utils";

const employee: Employee = {
  id: "emp-1", employeeCode: "EMP-0001", userId: "user-1", firstName: "Asha", lastName: "Rao", email: "asha@example.com", phone: "+919876543210", designation: "Analyst", employmentType: "FULL_TIME", joiningDate: "2025-01-01", employmentStatus: "ACTIVE",
  address: { addressLine1: "1 Main Road", city: "Pune", state: "MH", postalCode: "411001", country: "India" },
};

describe("employee form request mapping", () => {
  it("normalizes create input and omits empty optional fields", () => {
    const values = employeeToFormValues({ ...employee, phone: undefined, designation: undefined, address: undefined });
    values.firstName = " Asha ";
    values.email = " ASHA@EXAMPLE.COM ";
    expect(toCreateEmployeeRequest(values)).toEqual(expect.objectContaining({ firstName: "Asha", email: "asha@example.com", phone: undefined, designation: undefined, address: undefined }));
  });

  it("submits only fields changed by an edit", () => {
    const values = employeeToFormValues(employee);
    values.designation = "Senior Analyst";
    expect(toUpdateEmployeeRequest(values, employee)).toEqual({ designation: "Senior Analyst" });
  });

  it("uses an empty string to clear backend-supported text fields", () => {
    const values = employeeToFormValues(employee);
    values.phone = "";
    values.designation = "";
    expect(toUpdateEmployeeRequest(values, employee)).toEqual({ phone: "", designation: "" });
  });

  it("does not attempt unsupported clearing of nested values", () => {
    const values = employeeToFormValues(employee);
    values.addressLine1 = "";
    values.city = "";
    values.state = "";
    values.postalCode = "";
    values.country = "";
    expect(toUpdateEmployeeRequest(values, employee)).toEqual({});
  });
});
