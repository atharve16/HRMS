import { AxiosError } from "axios";
import { describe, expect, it } from "vitest";

import { ApiClientError, toApiClientError } from "@/services/api-error";

function axiosError(code: string, message = code, status?: number) {
  return new AxiosError(message, code, undefined, undefined, status
    ? { config: {} as never, status, statusText: String(status), data: {}, headers: {} }
    : undefined);
}

describe("centralized API error mapping", () => {
  it("distinguishes timeout from a connection failure", () => {
    const timeout = toApiClientError(axiosError("ECONNABORTED", "timeout exceeded"));
    const network = toApiClientError(axiosError("ERR_NETWORK", "Network Error"));

    expect(timeout).toMatchObject({ isTimeout: true, status: undefined });
    expect(network).toMatchObject({ isTimeout: false, status: undefined });
  });

  it.each([400, 401, 403, 404, 409, 429, 500, 502, 503, 504])(
    "preserves HTTP status %s",
    (status) => {
      expect(toApiClientError(axiosError("ERR_BAD_RESPONSE", "failed", status)).status)
        .toBe(status);
    },
  );

  it("preserves structured backend code, message, and field details", () => {
    const error = new AxiosError("failed", "ERR_BAD_REQUEST", undefined, undefined, {
      status: 400,
      statusText: "Bad Request",
      config: {} as never,
      headers: {},
      data: {
        success: false,
        message: "Request validation failed",
        data: {
          code: "VALIDATION_ERROR",
          path: "/api/v1/auth/request-otp",
          details: { email: "must be a valid email" },
        },
        timestamp: "2026-11-14T00:00:00Z",
      },
    });

    expect(toApiClientError(error)).toMatchObject({
      message: "Request validation failed",
      code: "VALIDATION_ERROR",
      status: 400,
      details: { email: "must be a valid email" },
    });
  });

  it("keeps manually created errors compatible with the mapper", () => {
    expect(new ApiClientError("message", { isTimeout: true }).isTimeout).toBe(true);
  });
});
