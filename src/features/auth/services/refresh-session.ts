import axios from "axios";

import type { AuthenticationResponse } from "@/features/auth/types/auth";
import { sessionStore } from "@/features/auth/services/session-store";
import type { ApiResponse } from "@/services/api-contract";
import { toApiClientError } from "@/services/api-error";
import { httpClientConfig } from "@/services/http-config";

type RefreshRequest = () => Promise<AuthenticationResponse>;

export function createRefreshCoordinator(
  refreshRequest: RefreshRequest,
  cooldownMs = 5_000,
) {
  let inFlight: Promise<AuthenticationResponse> | null = null;
  let lastSuccessTime = 0;
  let lastSuccessResult: AuthenticationResponse | null = null;

  return function refresh() {
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

    inFlight = refreshRequest()
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
          const status = axios.isAxiosError(error) ? error.response?.status : undefined;
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

const refreshClient = axios.create(httpClientConfig);

async function requestRefresh() {
  try {
    const response = await refreshClient.post<ApiResponse<AuthenticationResponse>>(
      "/auth/refresh",
    );
    sessionStore.establish(response.data.data);
    return response.data.data;
  } catch (error) {
    // Only clear session store if the refresh token is genuinely invalid or expired (401)
    const isUnauthorized =
      axios.isAxiosError(error) && error.response?.status === 401;
    if (isUnauthorized) {
      if (process.env.NODE_ENV !== "production") {
        console.log("[Auth] Refresh token is invalid or expired (401), clearing session");
      }
      sessionStore.clear();
    } else {
      if (process.env.NODE_ENV !== "production") {
        console.log(
          "[Auth] Refresh failed due to network or server error, preserving existing session state",
        );
      }
    }
    if (axios.isAxiosError(error)) throw toApiClientError(error);
    throw error;
  }
}

export const refreshSession = createRefreshCoordinator(requestRefresh);
