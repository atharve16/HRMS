import type { AxiosError } from "axios";

import type { ApiErrorData, ApiResponse } from "@/services/api-contract";

export class ApiClientError extends Error {
  readonly status: number | undefined;
  readonly code: string | undefined;
  readonly details: Record<string, string>;
  readonly isTimeout: boolean;
  readonly requestId: string | undefined;

  constructor(
    message: string,
    options: {
      status?: number;
      code?: string;
      details?: Record<string, string>;
      isTimeout?: boolean;
      requestId?: string;
    } = {},
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details ?? {};
    this.isTimeout = options.isTimeout ?? false;
    this.requestId = options.requestId;
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
  const isTimeout =
    error.code === "ECONNABORTED" ||
    error.code === "ETIMEDOUT" ||
    String(error.message ?? "").toLowerCase().includes("timeout");
  const message =
    envelope?.message ??
    (isTimeout
      ? "The request timed out."
      : status
        ? `Request failed with status ${status}.`
        : "Unable to reach the server.");
  const responseHeaders = error.response?.headers;
  const rawRequestId = responseHeaders?.["x-request-id"];
  const requestId =
    typeof rawRequestId === "string"
      ? rawRequestId
      : responseHeaders && typeof responseHeaders.get === "function"
        ? responseHeaders.get("x-request-id")
        : undefined;

  return new ApiClientError(message, {
    status,
    code: envelope?.data.code ?? error.code,
    details: envelope?.data.details,
    isTimeout,
    requestId: typeof requestId === "string" ? requestId : undefined,
  });
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}
