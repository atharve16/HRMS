import type { CreateAxiosDefaults } from "axios";

const configuredApiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.trim();

// Browser requests intentionally stay same-origin in production and are
// forwarded by next.config.ts.
export const apiBaseUrl =
  (configuredApiBaseUrl || "/api/v1").replace(/\/+$/, "") || "/api/v1";

export const httpClientConfig: CreateAxiosDefaults = {
  baseURL: apiBaseUrl,
  withCredentials: true,
  // Render cold starts plus the Brevo-backed OTP request can exceed 15s.
  // Mutations are never retried; query retries are bounded in QueryProvider.
  timeout: 30_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};
