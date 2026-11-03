import { describe, expect, it } from "vitest";

import { ApiClientError } from "@/services/api-error";
import { getPayrollErrorMessage } from "./payroll-errors";

describe("payroll-errors", () => {
  it("returns generic message for non-API error without message", () => {
    expect(getPayrollErrorMessage(null)).toBe(
      "Something went wrong while processing the payroll request. Please try again.",
    );
  });

  it("returns standard Error message for JS error", () => {
    expect(getPayrollErrorMessage(new Error("Network timeout"))).toBe(
      "Network timeout",
    );
  });

  it("handles offline / unreachable error without status", () => {
    const error = new ApiClientError("Network error", { status: 0 });
    expect(getPayrollErrorMessage(error)).toBe(
      "The HRMS service could not be reached. Check your connection and try again.",
    );
  });

  it("maps known payroll business codes correctly", () => {
    const draftError = new ApiClientError("Not draft", {
      status: 400,
      code: "PAYROLL_NOT_DRAFT",
    });
    expect(getPayrollErrorMessage(draftError)).toBe("Not draft");

    const existsError = new ApiClientError("", {
      status: 409,
      code: "PAYROLL_ALREADY_EXISTS",
    });
    expect(getPayrollErrorMessage(existsError)).toBe(
      "A payroll record already exists for the selected employee, month, and year.",
    );

    const negNetError = new ApiClientError("", {
      status: 400,
      code: "PAYROLL_NEGATIVE_NET",
    });
    expect(getPayrollErrorMessage(negNetError)).toBe(
      "Salary adjustments would produce an invalid or negative net salary.",
    );

    const salNotFound = new ApiClientError("", {
      status: 404,
      code: "SALARY_STRUCTURE_NOT_FOUND",
    });
    expect(getPayrollErrorMessage(salNotFound)).toBe(
      "No active salary structure found for this employee. Please configure salary first.",
    );
  });

  it("handles 500 server error default", () => {
    const serverError = new ApiClientError("Internal failure", {
      status: 500,
      code: "INTERNAL_ERROR",
    });
    expect(getPayrollErrorMessage(serverError)).toBe(
      "The HRMS payroll service is currently unavailable. Please try again shortly.",
    );
  });
});

