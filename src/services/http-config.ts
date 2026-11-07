import type { CreateAxiosDefaults } from "axios";

export const apiBaseUrl =  "/api/v1";

export const httpClientConfig: CreateAxiosDefaults = {
  baseURL: apiBaseUrl,
  withCredentials: true,
  timeout: 15_000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
};
