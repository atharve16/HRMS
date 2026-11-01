import { describe, expect, it, vi } from "vitest";

import { applyDepartmentFieldErrors, getDepartmentErrorMessage } from "@/features/departments/utils/department-errors";
import { ApiClientError } from "@/services/api-error";

describe("department error handling", () => {
  it("maps backend validation details onto form fields", () => {
    const setError = vi.fn();
    const error = new ApiClientError("invalid", { status: 400, code: "VALIDATION_ERROR", details: { departmentCode: "must match", name: "must not be blank" } });
    expect(applyDepartmentFieldErrors(error, setError)).toBe(true);
    expect(setError).toHaveBeenCalledWith("departmentCode", { type: "server", message: "must match" });
    expect(setError).toHaveBeenCalledWith("name", { type: "server", message: "must not be blank" });
  });

  it("preserves actionable backend conflicts", () => {
    const error = new ApiClientError("Reassign active employees before deactivating this department", { status: 409, code: "CONFLICT" });
    expect(getDepartmentErrorMessage(error)).toBe("Reassign active employees before deactivating this department");
  });
});
