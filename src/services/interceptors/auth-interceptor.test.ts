import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

const authDependencies = vi.hoisted(() => ({
  getAccessToken: vi.fn<() => string | undefined>(),
  refreshSession: vi.fn(),
}));

vi.mock("@/features/auth/services/refresh-session", () => ({
  refreshSession: authDependencies.refreshSession,
}));

vi.mock("@/features/auth/services/session-store", () => ({
  sessionStore: { getAccessToken: authDependencies.getAccessToken },
}));

import { attachAuthInterceptors } from "@/services/interceptors/auth-interceptor";

function rejection(status: number, config: InternalAxiosRequestConfig) {
  return Promise.reject(
    new AxiosError(
      `status ${status}`,
      AxiosError.ERR_BAD_RESPONSE,
      config,
      undefined,
      {
        config,
        data: {},
        headers: new AxiosHeaders(),
        status,
        statusText: String(status),
      },
    ),
  );
}

beforeEach(() => {
  authDependencies.getAccessToken.mockReset();
  authDependencies.refreshSession.mockReset();
});

describe("authentication interceptor", () => {
  it("does not treat a 403 authorization response as an expired session", async () => {
    authDependencies.getAccessToken.mockReturnValue("active-access");
    const client = axios.create({ adapter: (config) => rejection(403, config) });
    attachAuthInterceptors(client);

    await expect(client.get("/admin/employees")).rejects.toMatchObject({
      response: { status: 403 },
    });
    expect(authDependencies.refreshSession).not.toHaveBeenCalled();
  });

  it("does not refresh an anonymous 401 response", async () => {
    authDependencies.getAccessToken.mockReturnValue(undefined);
    const client = axios.create({ adapter: (config) => rejection(401, config) });
    attachAuthInterceptors(client);

    await expect(client.get("/auth/me")).rejects.toMatchObject({
      response: { status: 401 },
    });
    expect(authDependencies.refreshSession).not.toHaveBeenCalled();
  });

  it("refreshes once and retries a 401 request that carried an access token", async () => {
    authDependencies.getAccessToken
      .mockReturnValueOnce("expired-access")
      .mockReturnValue("new-access");
    authDependencies.refreshSession.mockResolvedValue({ accessToken: "new-access" });
    let attempts = 0;
    const client = axios.create({
      adapter: (config) => {
        attempts += 1;
        if (attempts === 1) return rejection(401, config);
        return Promise.resolve({
          config,
          data: { ok: true },
          headers: new AxiosHeaders(),
          status: 200,
          statusText: "OK",
        });
      },
    });
    attachAuthInterceptors(client);

    await expect(client.get("/auth/me")).resolves.toMatchObject({
      data: { ok: true },
    });
    expect(authDependencies.refreshSession).toHaveBeenCalledTimes(1);
    expect(attempts).toBe(2);
  });
});
