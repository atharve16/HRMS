import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiClientError } from "@/services/api-error";

const api = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
}));

vi.mock("@/services/api-client", () => ({ apiClient: api }));

import {
  getAuthenticatedUser,
  logout,
  requestOtp,
  verifyOtp,
} from "@/features/auth/services/auth-service";

const user = {
  id: "admin-1",
  email: "admin@example.com",
  role: "ADMIN" as const,
  status: "ACTIVE" as const,
};

function envelope<T>(data: T) {
  return {
    data: {
      success: true,
      message: "ok",
      data,
      timestamp: "2026-11-01T00:00:00Z",
    },
  };
}

beforeEach(() => {
  api.get.mockReset();
  api.post.mockReset();
});

describe("authentication API service", () => {
  it("requests an OTP with the backend DTO", async () => {
    api.post.mockResolvedValue(envelope({ expiresInSeconds: 300 }));
    await expect(requestOtp({ email: "person@example.com" })).resolves.toMatchObject({
      data: { expiresInSeconds: 300 },
    });
    expect(api.post).toHaveBeenCalledWith("/auth/request-otp", {
      email: "person@example.com",
    });
  });

  it("returns the authenticated user and access token after verification", async () => {
    api.post.mockResolvedValue(
      envelope({
        accessToken: "signed-access",
        tokenType: "Bearer",
        expiresInSeconds: 900,
        user,
      }),
    );
    await expect(
      verifyOtp({ email: "admin@example.com", otp: "123456" }),
    ).resolves.toMatchObject({ accessToken: "signed-access", user });
  });

  it("preserves invalid and expired OTP failures from the centralized client", async () => {
    api.post.mockRejectedValueOnce(
      new ApiClientError("invalid", { status: 401, code: "INVALID_OTP" }),
    );
    await expect(
      verifyOtp({ email: "admin@example.com", otp: "000000" }),
    ).rejects.toMatchObject({ code: "INVALID_OTP" });

    api.post.mockRejectedValueOnce(
      new ApiClientError("expired", { status: 401, code: "OTP_EXPIRED" }),
    );
    await expect(
      verifyOtp({ email: "admin@example.com", otp: "000000" }),
    ).rejects.toMatchObject({ code: "OTP_EXPIRED" });
  });

  it("loads /me and logs out through the documented endpoints", async () => {
    api.get.mockResolvedValue(envelope(user));
    api.post.mockResolvedValue(envelope({ loggedOut: true }));

    await expect(getAuthenticatedUser()).resolves.toEqual(user);
    await expect(logout()).resolves.toEqual({ loggedOut: true });
    expect(api.get).toHaveBeenCalledWith("/auth/me");
    expect(api.post).toHaveBeenCalledWith("/auth/logout");
  });
});
