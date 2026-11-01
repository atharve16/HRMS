export type ShiftStatus = "ACTIVE" | "INACTIVE";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type Shift = {
  id: string;
  shiftCode: string;
  name: string;
  description?: string;
  startTime: string; // e.g. "09:00:00" or "09:00"
  endTime: string;   // e.g. "17:00:00" or "17:00"
  workingDays: DayOfWeek[];
  gracePeriodMinutes: number;
  earlyDepartureGraceMinutes: number;
  expectedBreakMinutes: number;
  minimumBreakMinutes?: number;
  flexible: boolean;
  status: ShiftStatus;
  createdAt?: string;
  updatedAt?: string;
};

export type ShiftPage = {
  content: Shift[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type ShiftSortField =
  | "shiftCode"
  | "name"
  | "status"
  | "startTime"
  | "createdAt";

export type ShiftListParams = {
  page: number;
  limit: number;
  search?: string;
  status?: ShiftStatus;
  sortBy?: ShiftSortField;
  sortDirection?: "asc" | "desc";
};

export type CreateShiftRequest = {
  shiftCode: string;
  name: string;
  description?: string;
  startTime: string; // "HH:mm" or "HH:mm:ss"
  endTime: string;   // "HH:mm" or "HH:mm:ss"
  workingDays: DayOfWeek[];
  gracePeriodMinutes: number;
  earlyDepartureGraceMinutes: number;
  expectedBreakMinutes: number;
  minimumBreakMinutes?: number;
  flexible: boolean;
};

export type UpdateShiftRequest = {
  shiftCode?: string;
  name?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  workingDays?: DayOfWeek[];
  gracePeriodMinutes?: number;
  earlyDepartureGraceMinutes?: number;
  expectedBreakMinutes?: number;
  minimumBreakMinutes?: number;
  flexible?: boolean;
};

