export type UserRole = "ADMIN" | "EMPLOYEE";

export type UserStatus = "ACTIVE" | "INACTIVE";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  employeeId?: string;
};

export type RequestOtpRequest = {
  email: string;
};

export type OtpRequestResponse = {
  expiresInSeconds: number;
};

export type VerifyOtpRequest = {
  email: string;
  otp: string;
};

export type AuthenticationResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresInSeconds: number;
  user: AuthenticatedUser;
};

export type LogoutResponse = {
  loggedOut: boolean;
};

export type AuthSession = {
  accessToken: string;
  expiresAt: number;
  user: AuthenticatedUser;
};

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
