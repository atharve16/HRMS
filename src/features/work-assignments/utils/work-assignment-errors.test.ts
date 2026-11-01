import { describe, expect, it } from "vitest";

import {
  getWorkAssignmentErrorMessage,
  isWorkAssignmentConflictError,
  isWorkAssignmentNotFoundError,
} from "@/features/work-assignments/utils/work-assignment-errors";
import { ApiClientError } from "@/services/api-error";

describe("work assignment error utilities", () => {
  it("formats conflict errors with backend message", () => {
    const error = new ApiClientError(
      "Assignment period overlaps an existing active assignment",
      { status: 409, code: "CONFLICT" },
    );
    expect(getWorkAssignmentErrorMessage(error)).toBe(
      "Assignment period overlaps an existing active assignment",
    );
    expect(isWorkAssignmentConflictError(error)).toBe(true);
    expect(isWorkAssignmentNotFoundError(error)).toBe(false);
  });

  it("detects 404 not found errors", () => {
    const error = new ApiClientError("Work assignment was not found", {
      status: 404,
      code: "RESOURCE_NOT_FOUND",
    });
    expect(getWorkAssignmentErrorMessage(error)).toBe(
      "Work assignment was not found",
    );
    expect(isWorkAssignmentNotFoundError(error)).toBe(true);
    expect(isWorkAssignmentConflictError(error)).toBe(false);
  });

  it("handles offline network failure", () => {
    const error = new ApiClientError("Network error", { status: 0 });
    expect(getWorkAssignmentErrorMessage(error)).toBe(
      "The HRMS service could not be reached. Check your connection and try again.",
    );
  });

  it("handles unexpected non-api errors", () => {
    expect(getWorkAssignmentErrorMessage(new Error("Unknown"))).toBe(
      "Something went wrong. Please try again.",
    );
  });
});

