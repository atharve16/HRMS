import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";

import { synchronizeAttendanceMutation } from "@/features/attendance/hooks/attendance-mutation-utils";
import { attendanceKeys } from "@/features/attendance/hooks/attendance-query-keys";
import {
  adminAttendanceQueryOptions,
  attendanceDetailQueryOptions,
  employeeAttendanceQueryOptions,
  myTodayAttendanceQueryOptions,
} from "@/features/attendance/hooks/use-attendance";
import type { AttendanceResponse } from "@/features/attendance/types/attendance-types";

const mockAttendance: AttendanceResponse = {
  id: "att-101",
  employeeId: "emp-202",
  employeeCodeSnapshot: "EMP-202",
  employeeNameSnapshot: "Alex Morgan",
  workDate: "2026-11-02",
  attendanceStatus: "PRESENT",
  shiftSnapshot: {
    shiftId: "s-1",
    shiftCode: "GEN",
    shiftName: "General Shift",
    startTime: "09:00:00",
    endTime: "17:00:00",
    workingDays: ["MONDAY", "TUESDAY"],
    gracePeriodMinutes: 15,
    earlyDepartureGraceMinutes: 10,
    expectedBreakMinutes: 60,
    flexible: false,
    scheduledStartAt: "2026-11-02T03:30:00Z",
    scheduledEndAt: "2026-11-02T11:30:00Z",
  },
  officeSnapshot: {
    officeLocationId: "o-1",
    locationCode: "HQ",
    name: "Headquarters",
    coordinates: { type: "Point", coordinates: [77.5946, 12.9716] },
    geofenceRadiusMeters: 100,
    maximumGpsAccuracyMeters: 50,
  },
  sessions: [],
  totalWorkedMinutes: 480,
  totalBreakMinutes: 60,
  lateByMinutes: 0,
  earlyDepartureByMinutes: 0,
  overtimeMinutes: 0,
  activeSession: false,
  correctionHistory: [],
  createdAt: "2026-11-02T03:30:00Z",
  updatedAt: "2026-11-02T11:30:00Z",
};

describe("attendance queries and cache synchronization", () => {
  it("builds consistent query keys and enables queries appropriately", () => {
    const todayOptions = myTodayAttendanceQueryOptions("2026-11-02");
    expect(todayOptions.queryKey).toEqual([
      "attendance",
      "me",
      "today",
      "2026-11-02",
    ]);
    expect(todayOptions.enabled).toBe(true);

    const emptyToday = myTodayAttendanceQueryOptions("");
    expect(emptyToday.enabled).toBe(false);

    const adminOptions = adminAttendanceQueryOptions({ page: 0, limit: 20 });
    expect(adminOptions.queryKey).toEqual([
      "attendance",
      "admin",
      "list",
      { page: 0, limit: 20 },
    ]);

    const detailOptions = attendanceDetailQueryOptions("att-101");
    expect(detailOptions.queryKey).toEqual(["attendance", "detail", "att-101"]);
    expect(detailOptions.enabled).toBe(true);

    const empOptions = employeeAttendanceQueryOptions("emp-202", { page: 1 });
    expect(empOptions.queryKey).toEqual([
      "attendance",
      "admin",
      "employee",
      "emp-202",
      { page: 1 },
    ]);
  });

  it("updates detail cache and invalidates user and admin list queries on mutation", () => {
    const client = new QueryClient();
    client.setQueryData(attendanceKeys.myToday("2026-11-02"), mockAttendance);
    client.setQueryData(attendanceKeys.adminList({ page: 0, limit: 20 }), {
      content: [mockAttendance],
    });
    client.setQueryData(attendanceKeys.employeeHistory("emp-202"), {
      content: [mockAttendance],
    });

    const updated = {
      ...mockAttendance,
      totalWorkedMinutes: 510,
      overtimeMinutes: 30,
    };

    synchronizeAttendanceMutation(client, updated);

    expect(client.getQueryData(attendanceKeys.detail("att-101"))).toEqual(
      updated,
    );
    expect(
      client.getQueryState(attendanceKeys.myToday("2026-11-02"))?.isInvalidated,
    ).toBe(true);
    expect(
      client.getQueryState(attendanceKeys.adminList({ page: 0, limit: 20 }))
        ?.isInvalidated,
    ).toBe(true);
    expect(
      client.getQueryState(attendanceKeys.employeeHistory("emp-202"))
        ?.isInvalidated,
    ).toBe(true);
  });
});

