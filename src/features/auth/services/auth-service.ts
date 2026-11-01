import type {
  AuthenticatedUser,
  AuthenticationResponse,
  LogoutResponse,
  OtpRequestResponse,
  RequestOtpRequest,
  VerifyOtpRequest,
} from "@/features/auth/types/auth";
import type { ApiResponse } from "@/services/api-contract";
import { apiClient } from "@/services/api-client";

export async function requestOtp(request: RequestOtpRequest) {
  const response = await apiClient.post<ApiResponse<OtpRequestResponse>>(
    "/auth/request-otp",
    request,
  );
  return response.data;
}

export async function verifyOtp(request: VerifyOtpRequest) {
  const response = await apiClient.post<ApiResponse<AuthenticationResponse>>(
    "/auth/verify-otp",
    request,
  );
  return response.data.data;
}

export async function getAuthenticatedUser() {
  const response = await apiClient.get<ApiResponse<AuthenticatedUser>>("/auth/me");
  return response.data.data;
}

export async function logout() {
  const response = await apiClient.post<ApiResponse<LogoutResponse>>("/auth/logout");
  return response.data.data;
}
