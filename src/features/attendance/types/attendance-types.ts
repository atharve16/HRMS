export type AttendanceStatus =
  | "PRESENT"
  | "PARTIAL"
  | "INCOMPLETE"
  | "ABSENT"
  | "HOLIDAY"
  | "ON_LEAVE"
  | "HALF_DAY";

export type SessionStatus = "OPEN" | "COMPLETED" | "INCOMPLETE_CHECKOUT";

export interface GpsEvidence {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}

export interface GpsRequest {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
}

export interface AttendanceSession {
  sessionId: string;
  checkInAt: string;
  checkOutAt: string | null;
  checkInLocation: GpsEvidence | null;
  checkOutLocation: GpsEvidence | null;
  checkInDistanceMeters: number;
  checkOutDistanceMeters: number;
  checkInGpsAccuracyMeters: number;
  checkOutGpsAccuracyMeters: number;
  status: SessionStatus;
  closureType?: string | null;
  closureReason?: string | null;
  autoClosedAt?: string | null;
  originalCheckInAt?: string | null;
  attendanceDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ShiftSnapshot {
  shiftId: string;
  shiftCode: string;
  shiftName: string;
  startTime: string;
  endTime: string;
  workingDays: string[];
  gracePeriodMinutes: number;
  earlyDepartureGraceMinutes: number;
  expectedBreakMinutes: number;
  flexible: boolean;
  scheduledStartAt: string;
  scheduledEndAt: string;
}

export interface OfficeSnapshot {
  officeLocationId: string;
  locationCode: string;
  name: string;
  coordinates: {
    type: "Point";
    coordinates: [longitude: number, latitude: number];
  };
  geofenceRadiusMeters: number;
  maximumGpsAccuracyMeters: number;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface CorrectionHistoryEntry {
  correctionId: string;
  actorId: string;
  correctedAt: string;
  reason: string;
  sessionId: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}

export interface AttendanceResponse {
  id: string;
  employeeId: string;
  employeeCodeSnapshot: string;
  employeeNameSnapshot: string;
  workDate: string; // "YYYY-MM-DD"
  attendanceStatus: AttendanceStatus;
  shiftSnapshot: ShiftSnapshot;
  officeSnapshot: OfficeSnapshot;
  sessions: AttendanceSession[];
  totalWorkedMinutes: number;
  totalBreakMinutes: number;
  lateByMinutes: number;
  earlyDepartureByMinutes: number;
  overtimeMinutes: number;
  activeSession: boolean;
  correctionHistory: CorrectionHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStatusResponse {
  activeSession: boolean;
  attendance: AttendanceResponse | null;
  lastCheckInAt: string | null;
}

export interface AttendanceSummaryResponse {
  totalRecords: number;
  presentCount: number;
  partialCount: number;
  incompleteCount: number;
  totalWorkedMinutes: number;
  totalLateMinutes: number;
  totalEarlyDepartureMinutes: number;
  totalOvertimeMinutes: number;
}

export interface AttendancePageResponse {
  content: AttendanceResponse[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface AttendanceCorrectionRequest {
  sessionId: string;
  correctedCheckInAt: string; // ISO 8601
  correctedCheckOutAt?: string | null; // ISO 8601 or null
  reason: string;
}

export type AttendanceCorrectionStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
export type MissingPunchType = "CHECK_IN" | "CHECK_OUT" | "BOTH";

export interface SubmitAttendanceCorrectionRequest {
  attendanceDate: string;
  missingPunch: MissingPunchType;
  requestedCheckInTime?: string;
  requestedCheckOutTime?: string;
  reason: string;
}

export interface AttendanceCorrectionResponse {
  id: string;
  employeeId: string;
  employeeCode: string;
  employeeName: string;
  departmentId?: string;
  attendanceDate: string;
  missingPunch: MissingPunchType;
  requestedCheckInAt?: string | null;
  requestedCheckOutAt?: string | null;
  reason: string;
  status: AttendanceCorrectionStatus;
  adminResponse?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  existingAttendance?: AttendanceResponse | null;
  shift?: ShiftSnapshot | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AttendanceCorrectionPageResponse {
  content: AttendanceCorrectionResponse[];
  page: number;
  limit: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ReviewAttendanceCorrectionRequest { response?: string; }

export interface AttendanceHistoryParams {
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
}

export interface AdminAttendanceParams extends AttendanceHistoryParams {
  employeeId?: string;
  employeeCode?: string;
  departmentId?: string;
  officeLocationId?: string;
  shiftId?: string;
  status?: AttendanceStatus;
}

export interface AttendanceSummaryParams {
  employeeId?: string;
  employeeCode?: string;
  departmentId?: string;
  officeLocationId?: string;
  shiftId?: string;
  status?: AttendanceStatus;
  fromDate?: string;
  toDate?: string;
}

