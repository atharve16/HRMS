import { describe, expect, it } from "vitest";

import { getLeaveErrorMessage } from "@/features/leaves/utils/leave-errors";
import { ApiClientError } from "@/services/api-error";

describe("leave-errors", () => {
  it("maps OVERLAPPING_LEAVE code correctly", () => {
    const error = new ApiClientError("Overlap detected", {
      code: "OVERLAPPING_LEAVE",
      status: 409,
    });
    expect(getLeaveErrorMessage(error)).toBe("Overlap detected");
  });

  it("provides default message for OVERLAPPING_LEAVE if empty", () => {
    const error = new ApiClientError("", {
      code: "OVERLAPPING_LEAVE",
      status: 409,
    });
    expect(getLeaveErrorMessage(error)).toContain("overlaps");
  });

  it("maps INSUFFICIENT_LEAVE_BALANCE code correctly", () => {
    const error = new ApiClientError("Insufficient CL balance", {
      code: "INSUFFICIENT_LEAVE_BALANCE",
      status: 409,
    });
    expect(getLeaveErrorMessage(error)).toBe("Insufficient CL balance");
  });

  it("handles offline or network failure (status = 0)", () => {
    const error = new ApiClientError("Network unreachable", {
      code: "NETWORK_ERROR",
      status: 0,
    });
    expect(getLeaveErrorMessage(error)).toContain("could not be reached");
  });

  it("handles standard 500 error", () => {
    const error = new ApiClientError("Internal error", {
      code: "INTERNAL_ERROR",
      status: 500,
    });
    expect(getLeaveErrorMessage(error)).toContain("currently unavailable");
  });

  it("handles generic Error instances", () => {
    const error = new Error("Generic failure");
    expect(getLeaveErrorMessage(error)).toBe("Generic failure");
  });

  it("handles unknown values", () => {
    expect(getLeaveErrorMessage("random string")).toContain("Something went wrong");
  });
});
