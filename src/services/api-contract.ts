export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
};

export type ApiErrorData = {
  code: string;
  path: string;
  details: Record<string, string>;
};
