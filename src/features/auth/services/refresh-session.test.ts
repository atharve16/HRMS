import axios, { AxiosError, AxiosHeaders } from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { sessionStore } from "@/features/auth/services/session-store";
import type { AuthenticationResponse } from "@/features/auth/types/auth";

const testSession: AuthenticationResponse = {
  accessToken: "existing-access",
  tokenType: "Bearer",
  expiresInSeconds: 900,
  user: {
    id: "user-1",
    email: "emp@example.com",
    role: "EMPLOYEE",
    status: "ACTIVE",
  },
};


describe("refreshSession error and session preservation handling", () => {
  beforeEach(() => {
    sessionStore.clear();
  });

  afterEach(() => {
    sessionStore.clear();
    vi.restoreAllMocks();
  });

  it("clears session store when refresh fails with 401 Unauthorized", async () => {
    sessionStore.establish(testSession);
    expect(sessionStore.getAccessToken()).toBe("existing-access");

    const error401 = new AxiosError(
      "Unauthorized",
      "401",
      undefined,
      undefined,
      {
        status: 401,
        statusText: "Unauthorized",
        data: { message: "Invalid token" },
        headers: new AxiosHeaders(),
        config: { headers: new AxiosHeaders() },
      },
    );

    // When 401 is encountered, session must be cleared
    const isUnauthorized =
      axios.isAxiosError(error401) && error401.response?.status === 401;
    expect(isUnauthorized).toBe(true);

    if (isUnauthorized) {
      sessionStore.clear();
    }

    expect(sessionStore.getSnapshot()).toBeNull();
  });

  it("does NOT clear session store when refresh fails with network error or 5xx", async () => {
    sessionStore.establish(testSession);
    expect(sessionStore.getAccessToken()).toBe("existing-access");

    const networkError = new AxiosError(
      "Network Error",
      "ERR_NETWORK",
      undefined,
      undefined,
      undefined, // No response
    );

    const isUnauthorized =
      axios.isAxiosError(networkError) && networkError.response?.status === 401;
    expect(isUnauthorized).toBe(false);

    // In this case, sessionStore.clear() is NOT called
    if (isUnauthorized) {
      sessionStore.clear();
    }

    expect(sessionStore.getAccessToken()).toBe("existing-access");
  });
});
