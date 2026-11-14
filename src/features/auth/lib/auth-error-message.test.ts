import { describe, expect, it } from "vitest";

import { getAuthErrorMessage } from "@/features/auth/lib/auth-error-message";
import { ApiClientError } from "@/services/api-error";

describe("authentication error messages", () => {
  it("maps transport and upstream failures without calling them all unreachable", () => {
    expect(getAuthErrorMessage(new ApiClientError("timeout", { isTimeout: true })))
      .toContain("taking longer");
    expect(getAuthErrorMessage(new ApiClientError("network")))
      .toContain("Unable to connect");
    expect(getAuthErrorMessage(new ApiClientError("unavailable", { status: 503 })))
      .toContain("temporarily unavailable");
  });

  it("maps OTP rate limiting and keeps validation messages", () => {
    expect(getAuthErrorMessage(new ApiClientError("rate", { status: 429 })))
      .toContain("Too many OTP requests");
    expect(getAuthErrorMessage(new ApiClientError("Email is invalid", {
      status: 400,
      code: "VALIDATION_ERROR",
    }))).toContain("Check the information");
  });
});
