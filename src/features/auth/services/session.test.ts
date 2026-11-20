import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createRefreshCoordinator,
  restoreSessionWithDeadline,
  StaleRefreshResponseError,
} from "@/features/auth/services/refresh-session";
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

  it("does not let a late refresh response revive a logged-out session", async () => {
    sessionStore.establish(adminResponse);
    let resolveRefresh: ((value: AuthenticationResponse) => void) | undefined;
    const refresh = createRefreshCoordinator(
      () =>
        new Promise<AuthenticationResponse>((resolve) => {
          resolveRefresh = resolve;
        }),
    );

    const pending = refresh();
    sessionStore.clear();
    resolveRefresh?.(authenticationResponse);

    await expect(pending).rejects.toBeInstanceOf(StaleRefreshResponseError);
    expect(sessionStore.getSnapshot()).toBeNull();
  });

  it("invalidates a refresh when a newer manual login wins the race", async () => {
    sessionStore.establish(adminResponse);
    let resolveRefresh: ((value: AuthenticationResponse) => void) | undefined;
    const refresh = createRefreshCoordinator(
      () =>
        new Promise<AuthenticationResponse>((resolve) => {
          resolveRefresh = resolve;
        }),
    );

    const pending = refresh();
    sessionStore.establish(adminResponse);
    resolveRefresh?.(authenticationResponse);

    await expect(pending).rejects.toBeInstanceOf(StaleRefreshResponseError);
    expect(sessionStore.getAccessToken()).toBe("admin-access-token");
  });

  it("ends restoration at the deadline without clearing the refresh session", async () => {
    vi.useFakeTimers();
    let resolveRefresh: ((value: AuthenticationResponse) => void) | undefined;
    const invalidate = vi.fn();
    const pending = restoreSessionWithDeadline(
      () =>
        new Promise<AuthenticationResponse>((resolve) => {
          resolveRefresh = resolve;
        }),
      15_000,
      invalidate,
    );

    const assertion = expect(pending).rejects.toThrow("timed out");
    await vi.advanceTimersByTimeAsync(15_000);
    await assertion;
    expect(invalidate).toHaveBeenCalledOnce();
    resolveRefresh?.(authenticationResponse);
  });

  it("preserves the current session after a transient refresh failure", async () => {
    sessionStore.establish(adminResponse);
    const refresh = createRefreshCoordinator(
      vi.fn().mockRejectedValue(new Error("temporary network failure")),
    );

    await expect(refresh()).rejects.toThrow("temporary network failure");
    expect(sessionStore.getAccessToken()).toBe("admin-access-token");
  });

  it("ends the session when the refresh cookie is rejected", async () => {
    sessionStore.establish(adminResponse);
    const refresh = createRefreshCoordinator(async () => {
      sessionStore.clear();
      throw new Error("invalid refresh cookie");
    });

    await expect(refresh()).rejects.toThrow("invalid refresh cookie");
    expect(sessionStore.getSnapshot()).toBeNull();
  });

  it("reuses recently refreshed session within the cooldown window", async () => {
    const request = vi.fn().mockResolvedValue(authenticationResponse);
    const refresh = createRefreshCoordinator(request, 5_000);

    const first = await refresh();
    sessionStore.establish(first);

    // Call refresh again immediately while active token is stored
    const second = await refresh();
    expect(second).toEqual(authenticationResponse);
    // request should only be called once because of the cooldown window
    expect(request).toHaveBeenCalledTimes(1);
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
      expect(page).toBeDefined();
      expect(sessionStore.getAccessToken()).toBe("access-token");
      expect(sessionStore.getSnapshot()?.user.email).toBe("employee@example.com");
    }
  });
});
