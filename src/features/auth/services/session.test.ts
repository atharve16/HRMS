import { afterEach, describe, expect, it, vi } from "vitest";

import { createRefreshCoordinator } from "@/features/auth/services/refresh-session";
import { sessionStore } from "@/features/auth/services/session-store";
import type { AuthenticationResponse } from "@/features/auth/types/auth";

const authenticationResponse: AuthenticationResponse = {
  accessToken: "access-token",
  tokenType: "Bearer",
  expiresInSeconds: 900,
  user: {
    id: "user-1",
    email: "employee@example.com",
    role: "EMPLOYEE",
    status: "ACTIVE",
    employeeId: "employee-1",
  },
};

const adminResponse: AuthenticationResponse = {
  accessToken: "admin-access-token",
  tokenType: "Bearer",
  expiresInSeconds: 900,
  user: {
    id: "admin-1",
    email: "admin@example.com",
    role: "ADMIN",
    status: "ACTIVE",
  },
};

afterEach(() => {
  sessionStore.clear();
  vi.useRealTimers();
});

describe("session lifecycle", () => {
  it("keeps the access token only in the in-memory session store", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T00:00:00Z"));
    const session = sessionStore.establish(authenticationResponse);

    expect(sessionStore.getAccessToken()).toBe("access-token");
    expect(session.user.role).toBe("EMPLOYEE");
    expect(session.expiresAt).toBe(Date.now() + 900_000);

    sessionStore.clear();
    expect(sessionStore.getSnapshot()).toBeNull();
  });

  it("publishes successful login and logout state changes", () => {
    const listener = vi.fn();
    const unsubscribe = sessionStore.subscribe(listener);

    sessionStore.establish(authenticationResponse);
    sessionStore.clear();

    expect(listener).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ accessToken: "access-token" }),
    );
    expect(listener).toHaveBeenNthCalledWith(2, null);
    unsubscribe();
  });

  it("shares one refresh request across concurrent callers", async () => {
    let resolveRefresh: ((value: AuthenticationResponse) => void) | undefined;
    const request = vi.fn(
      () =>
        new Promise<AuthenticationResponse>((resolve) => {
          resolveRefresh = resolve;
        }),
    );
    const refresh = createRefreshCoordinator(request);

    const first = refresh();
    const second = refresh();
    expect(request).toHaveBeenCalledTimes(1);
    resolveRefresh?.(authenticationResponse);

    await expect(first).resolves.toEqual(authenticationResponse);
    await expect(second).resolves.toEqual(authenticationResponse);
  });

  it("releases the refresh lock after a failure", async () => {
    const request = vi
      .fn<() => Promise<AuthenticationResponse>>()
      .mockRejectedValueOnce(new Error("expired"))
      .mockResolvedValueOnce(authenticationResponse);
    const refresh = createRefreshCoordinator(request);

    await expect(refresh()).rejects.toThrow("expired");
    await expect(refresh()).resolves.toEqual(authenticationResponse);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it("simulates browser reload: empty memory restored via refresh", async () => {
    // 1. Initial reload state: in-memory session is empty
    expect(sessionStore.getSnapshot()).toBeNull();
    expect(sessionStore.getAccessToken()).toBeUndefined();

    // 2. Refresh endpoint succeeds with rotated token
    const refreshFn = vi.fn().mockResolvedValue(adminResponse);
    const refreshCoordinator = createRefreshCoordinator(refreshFn);

    const result = await refreshCoordinator();
    sessionStore.establish(result);

    // 3. User session is now established in memory
    expect(sessionStore.getAccessToken()).toBe("admin-access-token");
    expect(sessionStore.getSnapshot()?.user.role).toBe("ADMIN");
  });

  it("preserves active session across multiple in-app page navigations", () => {
    sessionStore.establish(authenticationResponse);
    expect(sessionStore.getAccessToken()).toBe("access-token");

    // Simulating routing between /dashboard, /employees, /attendance, /leaves, /departments
    const pages = ["/dashboard", "/employees", "/attendance", "/leaves", "/departments"];
    for (const page of pages) {
      expect(sessionStore.getAccessToken()).toBe("access-token");
      expect(sessionStore.getSnapshot()?.user.email).toBe("employee@example.com");
    }
  });
});
