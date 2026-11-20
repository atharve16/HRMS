import type { AuthenticationResponse } from "@/features/auth/types/auth";
import { sessionStore } from "@/features/auth/services/session-store";
import type { ApiResponse } from "@/services/api-contract";
import { isApiClientError } from "@/services/api-error";

type RefreshRequest = (timeoutMs?: number) => Promise<AuthenticationResponse>;

export const SESSION_RESTORATION_TIMEOUT_MS = 15_000;
const REFRESH_REQUEST_TIMEOUT_MS = SESSION_RESTORATION_TIMEOUT_MS;

export class StaleRefreshResponseError extends Error {
  constructor() {
    super("A refresh response was superseded by a newer authentication state.");
    this.name = "StaleRefreshResponseError";
  }
}

export class SessionRestorationTimeoutError extends Error {
  constructor() {
    super("Session restoration timed out.");
    this.name = "SessionRestorationTimeoutError";
  }
}

export function createRefreshCoordinator(
  refreshRequest: RefreshRequest,
  cooldownMs = 5_000,
) {
  let inFlight: Promise<AuthenticationResponse> | null = null;
  let inFlightRevision = 0;
  let lastSuccessTime = 0;
  let lastSuccessResult: AuthenticationResponse | null = null;

  return function refresh(timeoutMs?: number) {
    const activeToken = sessionStore.getAccessToken();
    if (
      lastSuccessResult &&
      activeToken &&
      lastSuccessResult.accessToken === activeToken &&
      Date.now() - lastSuccessTime < cooldownMs
    ) {
      return Promise.resolve(lastSuccessResult);
    }

    if (inFlight) return inFlight;

    if (process.env.NODE_ENV !== "production") {
      console.log("[Auth] Starting coordinated refresh request");
    }

<<<<<<< HEAD
    inFlight = refreshRequest(timeoutMs)
=======
    inFlightRevision = sessionStore.getRevision();
    inFlight = refreshRequest()
>>>>>>> 199b426 (added logo and header)
      .then((result) => {
        if (sessionStore.getRevision() !== inFlightRevision) {
          throw new StaleRefreshResponseError();
        }

        sessionStore.establish(result);
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

<<<<<<< HEAD
async function requestRefresh(timeoutMs?: number) {
=======
async function requestRefresh() {
  const requestRevision = sessionStore.getRevision();
>>>>>>> 199b426 (added logo and header)
  try {
    // Load the shared client lazily to avoid a module cycle while the auth
    // interceptor registers its refresh callback.
    const { apiClient } = await import("@/services/api-client");
    const response = await apiClient.post<ApiResponse<AuthenticationResponse>>(
      "/auth/refresh",
      undefined,
<<<<<<< HEAD
      timeoutMs ? { timeout: timeoutMs } : undefined,
=======
      { timeout: REFRESH_REQUEST_TIMEOUT_MS },
>>>>>>> 199b426 (added logo and header)
    );
    return response.data.data;
  } catch (error) {
    // Only an actual 401 invalidates the refresh cookie. Transient failures
    // must preserve the user's existing server-side session.
    const isUnauthorized = isApiClientError(error) && error.status === 401;
    if (isUnauthorized && sessionStore.getRevision() === requestRevision) {
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

export function restoreSessionWithDeadline(
  refresh: () => Promise<AuthenticationResponse>,
  timeoutMs = SESSION_RESTORATION_TIMEOUT_MS,
  onTimeout?: () => void,
) {
  return new Promise<AuthenticationResponse>((resolve, reject) => {
    let settled = false;
    const timeout = globalThis.setTimeout(() => {
      if (settled) return;
      settled = true;
      onTimeout?.();
      reject(new SessionRestorationTimeoutError());
    }, timeoutMs);

    refresh().then(
      (result) => {
        if (settled) return;
        settled = true;
        globalThis.clearTimeout(timeout);
        resolve(result);
      },
      (error: unknown) => {
        if (settled) return;
        settled = true;
        globalThis.clearTimeout(timeout);
        reject(error);
      },
    );
  });
}
