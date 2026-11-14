import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from "axios";

import { refreshSession } from "@/features/auth/services/refresh-session";
import { sessionStore } from "@/features/auth/services/session-store";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean;
  _hadAccessToken?: boolean;
};

const publicAuthPaths = [
  "/auth/request-otp",
  "/auth/verify-otp",
  "/auth/refresh",
];

function isPublicAuthRequest(url?: string) {
  if (!url) return false;
  const pathWithoutQuery = url.split("?")[0];
  return publicAuthPaths.some((path) => pathWithoutQuery.endsWith(path));
}

export function attachAuthInterceptors(client: AxiosInstance) {
  client.interceptors.request.use((config: RetryableRequestConfig) => {
    const accessToken = sessionStore.getAccessToken();

    if (accessToken && !isPublicAuthRequest(config.url)) {
      config.headers.set("Authorization", `Bearer ${accessToken}`);
      config._hadAccessToken = true;
    }

    return config;
  });

  client.interceptors.response.use(undefined, async (error: AxiosError) => {
    const request = error.config as RetryableRequestConfig | undefined;
    const shouldRefresh =
      error.response?.status === 401 &&
      request?._hadAccessToken === true &&
      request._authRetry !== true &&
      !isPublicAuthRequest(request.url);

    if (!shouldRefresh || !request) return Promise.reject(error);

    request._authRetry = true;

    const currentToken = sessionStore.getAccessToken();
    const sentAuthHeader =
      request.headers && typeof request.headers.get === "function"
        ? request.headers.get("Authorization")
        : (request.headers as Record<string, unknown> | undefined)?.["Authorization"];
    const sentToken =
      typeof sentAuthHeader === "string" && sentAuthHeader.startsWith("Bearer ")
        ? sentAuthHeader.slice(7)
        : null;

    if (currentToken && sentToken && currentToken !== sentToken) {
      request.headers.set("Authorization", `Bearer ${currentToken}`);
      return client(request);
    }

    try {
      const refreshed = await refreshSession();
      request.headers.set("Authorization", `Bearer ${refreshed.accessToken}`);
      return client(request);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  });
}
