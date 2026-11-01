import { describe, expect, it } from "vitest";

import { createEmployeeSchema, updateEmployeeSchema } from "@/features/employees/schemas/employee-schemas";
import { emptyEmployeeFormValues } from "@/features/employees/utils/employee-form-utils";

const valid = { ...emptyEmployeeFormValues, firstName: "Asha", lastName: "Rao", email: " ASHA@Example.com ", employmentType: "FULL_TIME" as const, joiningDate: "2025-01-01" };

describe("employee form schemas", () => {
  it("accepts the backend-required create fields", () => {
    expect(createEmployeeSchema.safeParse(valid).success).toBe(true);
  });

  it("matches email, phone, date, and length validation", () => {
    const result = createEmployeeSchema.safeParse({ ...valid, email: "invalid", phone: "123", dateOfBirth: "2999-01-01", firstName: "x".repeat(81) });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.map((issue) => issue.path[0])).toEqual(expect.arrayContaining(["email", "phone", "dateOfBirth", "firstName"]));
  });

  it("requires complete address and emergency-contact groups", () => {
    const result = createEmployeeSchema.safeParse({ ...valid, city: "Pune", emergencyName: "Nila" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues.map((issue) => issue.path[0])).toEqual(expect.arrayContaining(["addressLine1", "state", "postalCode", "country", "emergencyRelationship", "emergencyPhone"]));
  });

  it("allows edit termination dates only on or after joining", () => {
    expect(updateEmployeeSchema.safeParse({ ...valid, terminationDate: "2024-12-31" }).success).toBe(false);
    expect(updateEmployeeSchema.safeParse({ ...valid, terminationDate: "2025-01-01" }).success).toBe(true);
  });
});
