import axios from "axios";

import type { AuthenticationResponse } from "@/features/auth/types/auth";
import { sessionStore } from "@/features/auth/services/session-store";
import type { ApiResponse } from "@/services/api-contract";
import { toApiClientError } from "@/services/api-error";
import { httpClientConfig } from "@/services/http-config";

type RefreshRequest = () => Promise<AuthenticationResponse>;

export function createRefreshCoordinator(refreshRequest: RefreshRequest) {
  let inFlight: Promise<AuthenticationResponse> | null = null;

  return function refresh() {
    if (inFlight) return inFlight;

    inFlight = refreshRequest().finally(() => {
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
    sessionStore.clear();
    if (axios.isAxiosError(error)) throw toApiClientError(error);
    throw error;
  }
}

export const refreshSession = createRefreshCoordinator(requestRefresh);
