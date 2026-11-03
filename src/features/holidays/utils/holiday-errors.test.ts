import { describe, expect, it } from "vitest";

import { getHolidayErrorMessage } from "@/features/holidays/utils/holiday-errors";
import { ApiClientError } from "@/services/api-error";

describe("holiday-errors", () => {
  it("maps CONFLICT error message", () => {
    const error = new ApiClientError(
      "An active company holiday already exists for 2026-08-15",
      { code: "CONFLICT", status: 409 },
    );
    expect(getHolidayErrorMessage(error)).toBe(
      "An active company holiday already exists for 2026-08-15",
    );
  });

  it("handles offline status 0", () => {
    const error = new ApiClientError("Network error", { status: 0 });
    expect(getHolidayErrorMessage(error)).toContain("could not be reached");
  });

  it("handles 500 error", () => {
    const error = new ApiClientError("Server error", { status: 500 });
    expect(getHolidayErrorMessage(error)).toContain("currently unavailable");
  });

  it("handles generic Error", () => {
    expect(getHolidayErrorMessage(new Error("Local failure"))).toBe(
      "Local failure",
    );
  });
});

