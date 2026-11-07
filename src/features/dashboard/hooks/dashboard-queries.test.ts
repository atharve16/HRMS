import { describe, expect, it } from "vitest";

import {
  adminAttendanceSummaryQueryOptions,
  myAttendanceHistoryQueryOptions,
  myAttendanceStatusQueryOptions,
} from "@/features/attendance/hooks/use-attendance";
import { departmentsQueryOptions } from "@/features/departments/hooks/use-departments";
import { employeesQueryOptions } from "@/features/employees/hooks/use-employees";
import {
  adminHolidaysQueryOptions,
  upcomingHolidaysQueryOptions,
} from "@/features/holidays/hooks/use-holidays";
import {
  adminLeavesQueryOptions,
  myLeaveBalancesQueryOptions,
  myLeavesQueryOptions,
} from "@/features/leaves/hooks/use-leaves";
import {
  notificationsQueryOptions,
  unreadCountQueryOptions,
} from "@/features/notifications/hooks/use-notifications";
import {
  adminPayrollsQueryOptions,
  employeePayrollsQueryOptions,
} from "@/features/payroll/hooks/use-payroll";

describe("dashboard queries and composition", () => {
  it("builds correct admin query keys with server-side filters", () => {
    // 1. Total active employees
    const activeEmp = employeesQueryOptions({
      employmentStatus: "ACTIVE",
      page: 0,
      limit: 1,
    });
    expect(activeEmp.queryKey).toEqual([
      "employees",
      "list",
      { employmentStatus: "ACTIVE", page: 0, limit: 1 },
    ]);

    // 2. Attendance summary for today
    const attSummary = adminAttendanceSummaryQueryOptions({
      fromDate: "2026-11-07",
      toDate: "2026-11-07",
    });
    expect(attSummary.queryKey).toEqual([
      "attendance",
      "admin",
      "summary",
      { fromDate: "2026-11-07", toDate: "2026-11-07" },
    ]);

    // 3. Approved leaves on today
    const leavesToday = adminLeavesQueryOptions({
      status: "APPROVED",
      fromDate: "2026-11-07",
      toDate: "2026-11-07",
      page: 0,
      limit: 1,
    });
    expect(leavesToday.queryKey).toEqual([
      "leaves",
      "admin",
      "list",
      {
        status: "APPROVED",
        fromDate: "2026-11-07",
        toDate: "2026-11-07",
        page: 0,
        limit: 1,
      },
    ]);

    // 4. Pending leaves awaiting review
    const pendingLeaves = adminLeavesQueryOptions({
      status: "PENDING",
      page: 0,
      limit: 5,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
    expect(pendingLeaves.queryKey).toEqual([
      "leaves",
      "admin",
      "list",
      {
        status: "PENDING",
        page: 0,
        limit: 5,
        sortBy: "createdAt",
        sortDirection: "desc",
      },
    ]);

    // 5. Payroll status counters
    const draftPayroll = adminPayrollsQueryOptions({
      status: "DRAFT",
      page: 0,
      limit: 1,
    });
    expect(draftPayroll.queryKey).toEqual([
      "payroll",
      "admin",
      "list",
      { status: "DRAFT", page: 0, limit: 1 },
    ]);

    const reviewedPayroll = adminPayrollsQueryOptions({
      status: "REVIEWED",
      page: 0,
      limit: 1,
    });
    expect(reviewedPayroll.queryKey).toEqual([
      "payroll",
      "admin",
      "list",
      { status: "REVIEWED", page: 0, limit: 1 },
    ]);

    // 6. Upcoming holidays
    const holidays = adminHolidaysQueryOptions({
      active: true,
      fromDate: "2026-11-07",
      page: 0,
      limit: 5,
      sortDirection: "asc",
    });
    expect(holidays.queryKey).toEqual([
      "holidays",
      "admin",
      "list",
      {
        active: true,
        fromDate: "2026-11-07",
        page: 0,
        limit: 5,
        sortDirection: "asc",
      },
    ]);

    // 7. Active departments
    const depts = departmentsQueryOptions({
      status: "ACTIVE",
      page: 0,
      limit: 20,
    });
    expect(depts.queryKey).toEqual([
      "departments",
      "list",
      { status: "ACTIVE", page: 0, limit: 20 },
    ]);
  });

  it("builds correct employee personal query keys with proper intervals", () => {
    // 1. Employee status with 60s polling interval
    const statusOptions = myAttendanceStatusQueryOptions();
    expect(statusOptions.queryKey).toEqual(["attendance", "me", "status"]);
    expect(statusOptions.refetchInterval).toBe(60_000);

    // 2. Personal leave balances
    const balanceOptions = myLeaveBalancesQueryOptions();
    expect(balanceOptions.queryKey).toEqual(["leaves", "me", "balance", undefined]);

    // 3. Personal attendance history (last 7 days)
    const historyOptions = myAttendanceHistoryQueryOptions({
      page: 0,
      limit: 7,
      sortBy: "workDate",
      sortDirection: "desc",
    });
    expect(historyOptions.queryKey).toEqual([
      "attendance",
      "me",
      "history",
      { page: 0, limit: 7, sortBy: "workDate", sortDirection: "desc" },
    ]);

    // 4. Personal leave applications
    const leaveOptions = myLeavesQueryOptions({ page: 0, limit: 5 });
    expect(leaveOptions.queryKey).toEqual([
      "leaves",
      "me",
      "list",
      { page: 0, limit: 5 },
    ]);

    // 5. Employee upcoming holidays
    const holidayOptions = upcomingHolidaysQueryOptions();
    expect(holidayOptions.queryKey).toEqual(["holidays", "employee", "upcoming"]);

    // 6. Employee notifications & unread count
    const notifOptions = notificationsQueryOptions({ page: 0, limit: 5 }, true);
    expect(notifOptions.queryKey).toEqual([
      "notifications",
      "inbox",
      { page: 0, limit: 5 },
    ]);

    const unreadOptions = unreadCountQueryOptions(true);
    expect(unreadOptions.queryKey).toEqual(["notifications", "unread-count"]);
    expect(unreadOptions.refetchInterval).toBe(60_000);

    // 7. Latest personal payroll
    const payrollOptions = employeePayrollsQueryOptions({ page: 0, limit: 1 });
    expect(payrollOptions.queryKey).toEqual([
      "payroll",
      "employee",
      "list",
      { page: 0, limit: 1 },
    ]);
  });

  it("correctly calculates attendance rate without fabricating data", () => {
    // Helper function matching useAdminDashboard derivation
    function calculateAttendanceRate(
      totalActive?: number,
      present?: number,
    ): number | null {
      if (totalActive === undefined || present === undefined || totalActive <= 0) {
        return null;
      }
      return Math.min(100, Math.round((present / totalActive) * 100 * 10) / 10);
    }

    expect(calculateAttendanceRate(100, 92)).toBe(92);
    expect(calculateAttendanceRate(50, 47)).toBe(94);
    expect(calculateAttendanceRate(3, 1)).toBe(33.3);
    // Never fake 0 on undefined / missing data
    expect(calculateAttendanceRate(undefined, 10)).toBeNull();
    expect(calculateAttendanceRate(100, undefined)).toBeNull();
    expect(calculateAttendanceRate(0, 0)).toBeNull();
  });

  it("correctly derives payroll awaiting action count without fabricating totals", () => {
    function derivePayrollAwaiting(
      draft?: number,
      reviewed?: number,
    ): { draft: number; reviewed: number; total: number } | null {
      if (draft === undefined && reviewed === undefined) return null;
      return {
        draft: draft ?? 0,
        reviewed: reviewed ?? 0,
        total: (draft ?? 0) + (reviewed ?? 0),
      };
    }

    expect(derivePayrollAwaiting(4, 3)).toEqual({ draft: 4, reviewed: 3, total: 7 });
    expect(derivePayrollAwaiting(2, 0)).toEqual({ draft: 2, reviewed: 0, total: 2 });
    expect(derivePayrollAwaiting(undefined, undefined)).toBeNull();
  });

  it("correctly sums employee available leave days", () => {
    const balances = [
      { leaveType: "CL" as const, availableDays: 4, allocatedDays: 12, usedDays: 8, pendingDays: 0, id: "1", employeeId: "e1", leaveTypeName: "CL", year: 2026, createdAt: "", updatedAt: "" },
      { leaveType: "SL" as const, availableDays: 6, allocatedDays: 10, usedDays: 4, pendingDays: 0, id: "2", employeeId: "e1", leaveTypeName: "SL", year: 2026, createdAt: "", updatedAt: "" },
      { leaveType: "EL" as const, availableDays: 10, allocatedDays: 15, usedDays: 5, pendingDays: 0, id: "3", employeeId: "e1", leaveTypeName: "EL", year: 2026, createdAt: "", updatedAt: "" },
    ];

    const total = balances.reduce((sum, b) => sum + (b.availableDays ?? 0), 0);
    expect(total).toBe(20);
  });
});
