import type { AuthenticationResponse } from "@/features/auth/types/auth";
import { sessionStore } from "@/features/auth/services/session-store";
import type { ApiResponse } from "@/services/api-contract";
import { isApiClientError } from "@/services/api-error";

type RefreshRequest = (timeoutMs?: number) => Promise<AuthenticationResponse>;

export function createRefreshCoordinator(
  refreshRequest: RefreshRequest,
  cooldownMs = 5_000,
) {
  let inFlight: Promise<AuthenticationResponse> | null = null;
  let lastSuccessTime = 0;
  let lastSuccessResult: AuthenticationResponse | null = null;

  return function refresh(timeoutMs?: number) {
    const activeToken = sessionStore.getAccessToken();
    if (
      lastSuccessResult &&
      activeToken &&
      Date.now() - lastSuccessTime < cooldownMs
    ) {
      return Promise.resolve(lastSuccessResult);
    }

    if (inFlight) return inFlight;

    if (process.env.NODE_ENV !== "production") {
      console.log("[Auth] Starting coordinated refresh request");
    }

    inFlight = refreshRequest(timeoutMs)
      .then((result) => {
        if (process.env.NODE_ENV !== "production") {
          console.log("[Auth] Coordinated refresh request succeeded");
        }
        lastSuccessTime = Date.now();
        lastSuccessResult = result;
        return result;
      })
      .catch((error) => {
        if (process.env.NODE_ENV !== "production") {
          const status = isApiClientError(error) ? error.status : undefined;
          console.log(`[Auth] Coordinated refresh request failed (status: ${status})`);
        }
        lastSuccessResult = null;
        throw error;
      })
      .finally(() => {
        inFlight = null;
      });

    return inFlight;
  };
}

async function requestRefresh(timeoutMs?: number) {
  try {
    // Load the shared client lazily to avoid a module cycle while the auth
    // interceptor registers its refresh callback.
    const { apiClient } = await import("@/services/api-client");
    const response = await apiClient.post<ApiResponse<AuthenticationResponse>>(
      "/auth/refresh",
      undefined,
      timeoutMs ? { timeout: timeoutMs } : undefined,
    );
    sessionStore.establish(response.data.data);
    return response.data.data;
  } catch (error) {
    // Only an actual 401 invalidates the refresh cookie. Transient failures
    // must preserve the user's existing server-side session.
    const isUnauthorized = isApiClientError(error) && error.status === 401;
    if (isUnauthorized) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[Auth] Refresh token is invalid or expired (401), clearing session");
      }
      sessionStore.clear();
    } else if (process.env.NODE_ENV !== "production") {
      console.log("[Auth] Refresh failed transiently; preserving session state");
    }
    throw error;
  }
}

export const refreshSession = createRefreshCoordinator(requestRefresh);
