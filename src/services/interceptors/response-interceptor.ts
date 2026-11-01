import axios, { type AxiosInstance } from "axios";

import { ApiClientError, toApiClientError } from "@/services/api-error";

export function attachResponseInterceptor(client: AxiosInstance) {
  return client.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (error instanceof ApiClientError) return Promise.reject(error);
      if (axios.isAxiosError(error)) return Promise.reject(toApiClientError(error));
      return Promise.reject(error);
    },
  );
}
