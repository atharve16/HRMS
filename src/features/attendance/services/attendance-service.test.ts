import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));
vi.mock("@/services/api-client", () => ({ apiClient: api }));

import {
  checkIn,
  checkOut,
  correctAttendance,
  getAdminAttendanceSummary,
  getAttendanceDetail,
  getEmployeeAttendanceHistory,
  getMyAttendance,
  getMyAttendanceHistory,
  getMyAttendanceStatus,
  listAdminAttendance,
} from "@/features/attendance/services/attendance-service";
import type {
  AttendanceCorrectionRequest,
  AttendanceResponse,
  GpsRequest,
} from "@/features/attendance/types/attendance-types";
import { ApiClientError } from "@/services/api-error";

const sampleAttendance: AttendanceResponse = {
  id: "att-123",
  employeeId: "emp-456",
  employeeCodeSnapshot: "EMP-001",
  employeeNameSnapshot: "Jane Doe",
  workDate: "2026-11-02",
  attendanceStatus: "PRESENT",
  shiftSnapshot: {
    shiftId: "shift-1",
    shiftCode: "GEN-01",
    shiftName: "General Shift",
    startTime: "09:00:00",
    endTime: "17:00:00",
    workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
    gracePeriodMinutes: 15,
    earlyDepartureGraceMinutes: 10,
    expectedBreakMinutes: 60,
    flexible: false,
    scheduledStartAt: "2026-11-02T03:30:00Z",
    scheduledEndAt: "2026-11-02T11:30:00Z",
  },
  officeSnapshot: {
    officeLocationId: "off-1",
    locationCode: "HQ",
    name: "Headquarters",
    coordinates: {
      type: "Point",
      coordinates: [77.5946, 12.9716],
    },
    geofenceRadiusMeters: 100,
    maximumGpsAccuracyMeters: 50,
  },
  sessions: [
    {
      sessionId: "sess-1",
      checkInAt: "2026-11-02T03:30:00Z",
      checkOutAt: "2026-11-02T11:30:00Z",
      checkInLocation: { latitude: 12.9716, longitude: 77.5946, accuracyMeters: 10 },
      checkOutLocation: { latitude: 12.9716, longitude: 77.5946, accuracyMeters: 12 },
      checkInDistanceMeters: 15,
      checkOutDistanceMeters: 18,
      checkInGpsAccuracyMeters: 10,
      checkOutGpsAccuracyMeters: 12,
      status: "COMPLETED",
      createdAt: "2026-11-02T03:30:00Z",
      updatedAt: "2026-11-02T11:30:00Z",
    },
  ],
  totalWorkedMinutes: 480,
  totalBreakMinutes: 0,
  lateByMinutes: 0,
  earlyDepartureByMinutes: 0,
  overtimeMinutes: 0,
  activeSession: false,
  correctionHistory: [],
  createdAt: "2026-11-02T03:30:00Z",
  updatedAt: "2026-11-02T11:30:00Z",
};

const envelope = <T>(data: T) => ({
  data: { success: true, message: "ok", data, timestamp: "2026-11-02T00:00:00Z" },
});

beforeEach(() => {
  api.get.mockReset();
  api.post.mockReset();
  api.patch.mockReset();
});

describe("attendance API service", () => {
  it("submits checkIn and checkOut with GPS coordinates", async () => {
    api.post.mockResolvedValue(envelope(sampleAttendance));

    const gpsReq: GpsRequest = { latitude: 12.9716, longitude: 77.5946, accuracyMeters: 15 };

    const inResult = await checkIn(gpsReq);
    expect(inResult).toEqual(sampleAttendance);
    expect(api.post).toHaveBeenCalledWith("/attendance/check-in", gpsReq);

    const outResult = await checkOut(gpsReq);
    expect(outResult).toEqual(sampleAttendance);
    expect(api.post).toHaveBeenCalledWith("/attendance/check-out", gpsReq);
  });

  it("fetches today attendance, status, and history for employee", async () => {
    api.get.mockResolvedValueOnce(envelope(sampleAttendance));
    const today = await getMyAttendance("2026-11-02");
    expect(today).toEqual(sampleAttendance);
    expect(api.get).toHaveBeenCalledWith("/attendance/me", { params: { date: "2026-11-02" } });

    api.get.mockResolvedValueOnce(envelope({ activeSession: false, attendance: sampleAttendance, lastCheckInAt: null }));
    const status = await getMyAttendanceStatus();
    expect(status.activeSession).toBe(false);
    expect(api.get).toHaveBeenCalledWith("/attendance/me/status");

    api.get.mockResolvedValueOnce(envelope({ content: [sampleAttendance], page: 0, limit: 20, totalElements: 1, totalPages: 1, first: true, last: true }));
    const history = await getMyAttendanceHistory({ page: 0, limit: 20 });
    expect(history.content).toHaveLength(1);
    expect(api.get).toHaveBeenCalledWith("/attendance/me/history", { params: { page: 0, limit: 20 } });
  });

  it("fetches admin directory list and summary metrics with query parameters", async () => {
    const pageResp = { content: [sampleAttendance], page: 0, limit: 20, totalElements: 1, totalPages: 1, first: true, last: true };
    api.get.mockResolvedValueOnce(envelope(pageResp));

    const adminParams = { employeeId: "emp-456", status: "PRESENT" as const, page: 0, limit: 20 };
    const listResult = await listAdminAttendance(adminParams);
    expect(listResult).toEqual(pageResp);
    expect(api.get).toHaveBeenCalledWith("/admin/attendance", { params: adminParams });

    const summaryResp = {
      totalRecords: 10,
      presentCount: 8,
      partialCount: 1,
      incompleteCount: 1,
      totalWorkedMinutes: 4800,
      totalLateMinutes: 15,
      totalEarlyDepartureMinutes: 0,
      totalOvertimeMinutes: 30,
    };
    api.get.mockResolvedValueOnce(envelope(summaryResp));
    const summaryResult = await getAdminAttendanceSummary({ status: "PRESENT" });
    expect(summaryResult).toEqual(summaryResp);
    expect(api.get).toHaveBeenCalledWith("/admin/attendance/summary", { params: { status: "PRESENT" } });
  });

  it("gets single record detail and submits admin correction", async () => {
    api.get.mockResolvedValueOnce(envelope(sampleAttendance));
    const detail = await getAttendanceDetail("att-123");
    expect(detail).toEqual(sampleAttendance);
    expect(api.get).toHaveBeenCalledWith("/admin/attendance/att-123");

    api.patch.mockResolvedValueOnce(envelope(sampleAttendance));
    const correctionReq: AttendanceCorrectionRequest = {
      sessionId: "sess-1",
      correctedCheckInAt: "2026-11-02T03:30:00Z",
      correctedCheckOutAt: "2026-11-02T11:45:00Z",
      reason: "Employee forgot to punch out due to system maintenance",
    };
    const corrected = await correctAttendance("att-123", correctionReq);
    expect(corrected).toEqual(sampleAttendance);
    expect(api.patch).toHaveBeenCalledWith("/admin/attendance/att-123/correction", correctionReq);
  });

  it("fetches employee-specific attendance history for admin view", async () => {
    const pageResp = { content: [sampleAttendance], page: 0, limit: 10, totalElements: 1, totalPages: 1, first: true, last: true };
    api.get.mockResolvedValueOnce(envelope(pageResp));

    const result = await getEmployeeAttendanceHistory("emp-456", { page: 0, limit: 10 });
    expect(result).toEqual(pageResp);
    expect(api.get).toHaveBeenCalledWith("/admin/employees/emp-456/attendance", { params: { page: 0, limit: 10 } });
  });

  it("preserves geofence and accuracy errors", async () => {
    const geofenceError = new ApiClientError("Location is outside the assigned office geofence", {
      status: 403,
      code: "OUTSIDE_GEOFENCE",
    });
    api.post.mockRejectedValue(geofenceError);

    await expect(checkIn({ latitude: 12.0, longitude: 77.0, accuracyMeters: 10 })).rejects.toBe(geofenceError);
  });
});

