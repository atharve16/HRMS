import { isApiClientError } from "@/services/api-error";

const errorMessages: Record<string, string> = {
  INVALID_OTP: "That code is not valid. Check the email and try again.",
  OTP_EXPIRED: "That code has expired. Request a new code to continue.",
  OTP_ATTEMPTS_EXCEEDED:
    "Too many incorrect attempts. Request a new code to continue.",
  OTP_RESEND_COOLDOWN: "Please wait before requesting another code.",
  RATE_LIMIT_EXCEEDED:
    "Too many requests were made. Please wait a few minutes and try again.",
  EMPLOYEE_INACTIVE:
    "This account is inactive. Contact your HR administrator for help.",
  AUTH_DELIVERY_FAILED:
    "The code could not be delivered right now. Please try again shortly.",
  INVALID_REFRESH_TOKEN: "Your session has expired. Please sign in again.",
  REFRESH_TOKEN_REUSED: "Your session is no longer valid. Please sign in again.",
  VALIDATION_ERROR: "Check the information you entered and try again.",
};

export function getAuthErrorMessage(error: unknown) {
  if (!isApiClientError(error)) {
    return "Something went wrong. Please try again.";
  }

  if (error.code && errorMessages[error.code]) {
    return errorMessages[error.code];
  }

  if (!error.status) {
    return "We could not reach the HRMS service. Check your connection and try again.";
  }

  if (error.status >= 500) {
    return "The HRMS service is unavailable right now. Please try again shortly.";
  }

  return error.message;
}
