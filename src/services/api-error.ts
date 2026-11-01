import type { AxiosError } from "axios";

import type { ApiErrorData, ApiResponse } from "@/services/api-contract";

export class ApiClientError extends Error {
  readonly status: number | undefined;
  readonly code: string | undefined;
  readonly details: Record<string, string>;

  constructor(
    message: string,
    options: {
      status?: number;
      code?: string;
      details?: Record<string, string>;
    } = {},
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details ?? {};
  }
}

function isErrorEnvelope(data: unknown): data is ApiResponse<ApiErrorData> {
  if (!data || typeof data !== "object") return false;

  const payload = data as Partial<ApiResponse<Partial<ApiErrorData>>>;
  return (
    typeof payload.message === "string" &&
    Boolean(payload.data) &&
    typeof payload.data?.code === "string"
  );
}

export function toApiClientError(error: AxiosError<unknown>) {
  const status = error.response?.status;
  const envelope = isErrorEnvelope(error.response?.data)
    ? error.response.data
    : undefined;
  const message =
    envelope?.message ??
    (status ? `Request failed with status ${status}.` : "Unable to reach the server.");

  return new ApiClientError(message, {
    status,
    code: envelope?.data.code ?? error.code,
    details: envelope?.data.details,
  });
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}
