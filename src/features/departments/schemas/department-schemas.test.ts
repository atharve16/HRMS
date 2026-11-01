import { describe, expect, it } from "vitest";

import { departmentFormSchema } from "@/features/departments/schemas/department-schemas";

describe("department form schema", () => {
  it("accepts all backend-supported fields", () => {
    expect(departmentFormSchema.safeParse({ departmentCode: "eng-2", name: "Engineering", description: "Builds products", managerEmployeeId: "507f1f77bcf86cd799439011" }).success).toBe(true);
  });

  it("matches the department-code contract", () => {
    for (const departmentCode of ["A", "contains spaces", "x".repeat(21), "ENG!"]) {
      expect(departmentFormSchema.safeParse({ departmentCode, name: "Engineering", description: "", managerEmployeeId: "" }).success).toBe(false);
    }
  });

  it("requires a nonblank name and backend length limits", () => {
    expect(departmentFormSchema.safeParse({ departmentCode: "ENG", name: " ", description: "", managerEmployeeId: "" }).success).toBe(false);
    expect(departmentFormSchema.safeParse({ departmentCode: "ENG", name: "x".repeat(121), description: "x".repeat(1001), managerEmployeeId: "" }).success).toBe(false);
  });

  it("accepts no manager but rejects malformed manager identifiers", () => {
    expect(departmentFormSchema.safeParse({ departmentCode: "ENG", name: "Engineering", description: "", managerEmployeeId: "" }).success).toBe(true);
    expect(departmentFormSchema.safeParse({ departmentCode: "ENG", name: "Engineering", description: "", managerEmployeeId: "not-an-object-id" }).success).toBe(false);
  });
});
