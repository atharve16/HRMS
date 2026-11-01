import { describe, expect, it } from "vitest";

import type { Department } from "@/features/departments/types/department-types";
import {
  departmentToFormValues,
  toCreateDepartmentRequest,
  toUpdateDepartmentRequest,
} from "@/features/departments/utils/department-form-utils";

const department: Department = { id: "dep-1", departmentCode: "ENG", name: "Engineering", description: "Builds products", managerEmployeeId: "507f1f77bcf86cd799439011", status: "ACTIVE" };

describe("department form request mapping", () => {
  it("normalizes code and text on creation", () => {
    expect(toCreateDepartmentRequest({ departmentCode: " eng ", name: " Engineering ", description: " Builds products ", managerEmployeeId: "" })).toEqual({ departmentCode: "ENG", name: "Engineering", description: "Builds products", managerEmployeeId: undefined });
  });

  it("submits only changed edit fields", () => {
    const values = departmentToFormValues(department);
    values.name = "Platform Engineering";
    expect(toUpdateDepartmentRequest(values, department)).toEqual({ name: "Platform Engineering" });
  });

  it("supports clearing description and manager", () => {
    const values = departmentToFormValues(department);
    values.description = "";
    values.managerEmployeeId = "";
    expect(toUpdateDepartmentRequest(values, department)).toEqual({ description: "", managerEmployeeId: "" });
  });

  it("does not send an unchanged form", () => {
    expect(toUpdateDepartmentRequest(departmentToFormValues(department), department)).toEqual({});
  });
});
