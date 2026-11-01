import type { AxiosError } from "axios";
import { describe, expect, it } from "vitest";

import { getAuthErrorMessage } from "@/features/auth/lib/auth-error-message";
import { ApiClientError, toApiClientError } from "@/services/api-error";

describe("backend error handling", () => {
  it("reads the Spring API error envelope", () => {
    const error = {
      code: "ERR_BAD_REQUEST",
      response: {
        status: 400,
        data: {
          success: false,
          message: "Request validation failed",
          data: {
            code: "VALIDATION_ERROR",
            path: "/api/v1/auth/request-otp",
            details: { email: "must be a well-formed email address" },
          },
          timestamp: "2026-11-01T00:00:00Z",
        },
      },
    } as AxiosError;

    const parsed = toApiClientError(error);
    expect(parsed.code).toBe("VALIDATION_ERROR");
    expect(parsed.status).toBe(400);
    expect(parsed.details.email).toContain("well-formed");
  });

  it.each([
    ["INVALID_OTP", "not valid"],
    ["OTP_EXPIRED", "expired"],
    ["OTP_ATTEMPTS_EXCEEDED", "Too many incorrect"],
    ["EMPLOYEE_INACTIVE", "inactive"],
    ["RATE_LIMIT_EXCEEDED", "Too many requests"],
  ])("maps %s to actionable copy", (code, phrase) => {
    expect(getAuthErrorMessage(new ApiClientError("backend", { code }))).toContain(phrase);
  });

  it("distinguishes a network failure", () => {
    expect(getAuthErrorMessage(new ApiClientError("network"))).toContain(
      "could not reach",
    );
  });
});
