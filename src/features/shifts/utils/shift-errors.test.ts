import { describe, expect, it, vi } from "vitest";

import {
  applyShiftFieldErrors,
  getShiftErrorMessage,
  isShiftNotFoundError,
} from "@/features/shifts/utils/shift-errors";
import { ApiClientError } from "@/services/api-error";

describe("shift error handling", () => {
  it("applies server validation details to react-hook-form", () => {
    const setError = vi.fn();
    const error = new ApiClientError("Validation failed", {
      status: 400,
      code: "VALIDATION_ERROR",
      details: {
        shiftCode: "Shift code already exists",
        startTime: "Start time is invalid",
        minimumBreakMinutes: "Minimum break cannot exceed expected break minutes",
      },
    });

    const applied = applyShiftFieldErrors(error, setError);
    expect(applied).toBe(true);
    expect(setError).toHaveBeenCalledWith("shiftCode", {
      type: "server",
      message: "Shift code already exists",
    });
    expect(setError).toHaveBeenCalledWith("startTime", {
      type: "server",
      message: "Start time is invalid",
    });
    expect(setError).toHaveBeenCalledWith("minimumBreakMinutes", {
      type: "server",
      message: "Minimum break cannot exceed expected break minutes",
    });
  });

  it("maps conflict, not found, network, and server errors to user messages", () => {
    expect(
      getShiftErrorMessage(
        new ApiClientError("Shift code already exists", {
          status: 409,
          code: "CONFLICT",
        }),
      ),
    ).toBe("Shift code already exists");

    expect(
      getShiftErrorMessage(
        new ApiClientError("Shift was not found", {
          status: 404,
          code: "RESOURCE_NOT_FOUND",
        }),
      ),
    ).toBe("Shift was not found");

    expect(
      getShiftErrorMessage(
        new ApiClientError("Network error", {
          status: 0,
          code: "NETWORK_ERROR",
        }),
      ),
    ).toContain("could not be reached");

    expect(
      getShiftErrorMessage(
        new ApiClientError("Validation error", {
          status: 400,
          code: "VALIDATION_ERROR",
        }),
      ),
    ).toContain("information is invalid");

    expect(
      getShiftErrorMessage(
        new ApiClientError("Server failure", {
          status: 500,
          code: "SERVER_ERROR",
        }),
      ),
    ).toContain("unavailable right now");
  });

  it("identifies not found errors", () => {
    expect(
      isShiftNotFoundError(
        new ApiClientError("Not found", { status: 404, code: "NOT_FOUND" }),
      ),
    ).toBe(true);
    expect(
      isShiftNotFoundError(
        new ApiClientError("Conflict", { status: 409, code: "CONFLICT" }),
      ),
    ).toBe(false);
  });
});

