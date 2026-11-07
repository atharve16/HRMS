"use client";

import { useCallback, useMemo, useState } from "react";

import {
  useMyAttendanceHistory,
  useMyAttendanceStatus,
} from "@/features/attendance/hooks/use-attendance";
import { getCompanyTodayDate } from "@/features/dashboard/utils/dashboard-time";
import { useUpcomingHolidays } from "@/features/holidays/hooks/use-holidays";
import { useMyLeaveBalances, useMyLeaves } from "@/features/leaves/hooks/use-leaves";
import {
  useNotifications,
  useUnreadCount,
} from "@/features/notifications/hooks/use-notifications";
import { useEmployeePayrolls } from "@/features/payroll/hooks/use-payroll";

export function useEmployeeDashboard() {
  const [today] = useState(() => getCompanyTodayDate());

  // 1. Current attendance status & open session
  const attendanceStatusQuery = useMyAttendanceStatus();

  // 2. Personal leave balances
  const leaveBalancesQuery = useMyLeaveBalances();

  // 3. Recent personal attendance records (last 7 entries)
  const attendanceHistoryQuery = useMyAttendanceHistory({
    page: 0,
    limit: 7,
    sortBy: "workDate",
    sortDirection: "desc",
  });

  // 4. Recent personal leave applications
  const myLeavesQuery = useMyLeaves({
    page: 0,
    limit: 5,
  });

  // 5. Upcoming holidays
  const upcomingHolidaysQuery = useUpcomingHolidays();

  // 6. Recent personal notifications & unread count
  const notificationsQuery = useNotifications({ page: 0, limit: 5 });
  const unreadCountQuery = useUnreadCount();

  // 7. Latest finalized or paid payroll record
  const latestPayrollQuery = useEmployeePayrolls({ page: 0, limit: 1 });

  // Compute total available leave days across allocated leave types
  const totalAvailableLeaveDays = useMemo(() => {
    const balances = leaveBalancesQuery.data;
    if (!balances || !Array.isArray(balances)) return null;
    return balances.reduce((sum, b) => sum + (b.availableDays ?? 0), 0);
  }, [leaveBalancesQuery.data]);

  // Compute latest payroll record
  const latestPayroll = useMemo(() => {
    return latestPayrollQuery.data?.items?.[0] ?? null;
  }, [latestPayrollQuery.data?.items]);

  // Check if any query is refetching
  const isRefreshing =
    attendanceStatusQuery.isFetching ||
    leaveBalancesQuery.isFetching ||
    attendanceHistoryQuery.isFetching ||
    myLeavesQuery.isFetching ||
    upcomingHolidaysQuery.isFetching ||
    notificationsQuery.isFetching ||
    unreadCountQuery.isFetching ||
    latestPayrollQuery.isFetching;

  const refreshAll = useCallback(async () => {
    await Promise.all([
      attendanceStatusQuery.refetch(),
      leaveBalancesQuery.refetch(),
      attendanceHistoryQuery.refetch(),
      myLeavesQuery.refetch(),
      upcomingHolidaysQuery.refetch(),
      notificationsQuery.refetch(),
      unreadCountQuery.refetch(),
      latestPayrollQuery.refetch(),
    ]);
  }, [
    attendanceStatusQuery,
    leaveBalancesQuery,
    attendanceHistoryQuery,
    myLeavesQuery,
    upcomingHolidaysQuery,
    notificationsQuery,
    unreadCountQuery,
    latestPayrollQuery,
  ]);

  return {
    today,
    attendanceStatusQuery,
    leaveBalancesQuery,
    attendanceHistoryQuery,
    myLeavesQuery,
    upcomingHolidaysQuery,
    notificationsQuery,
    unreadCountQuery,
    latestPayrollQuery,
    totalAvailableLeaveDays,
    latestPayroll,
    isRefreshing,
    refreshAll,
  };
}

