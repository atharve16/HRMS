import {
  CalendarDays,
  CalendarX2,
  Clock3,
  PartyPopper,
  UserCheck,
  Users,
  UserX,
  WalletCards,
} from "lucide-react";

import { DashboardStatCard } from "@/features/dashboard/components/shared/dashboard-stat-card";
import type { useAdminDashboard } from "@/features/dashboard/hooks/use-admin-dashboard";

type AdminStatCardsProps = {
  dashboard: ReturnType<typeof useAdminDashboard>;
};

export function AdminStatCards({ dashboard }: AdminStatCardsProps) {
  const {
    activeEmployeesQuery,
    todayAttendanceSummaryQuery,
    onLeaveTodayQuery,
    pendingLeavesQuery,
    upcomingHolidaysQuery,
    payrollAwaitingAction,
    payrollDraftQuery,
    payrollReviewedQuery,
    attendanceRate,
  } = dashboard;

  const totalActive = activeEmployeesQuery.data?.totalElements;
  const presentCount = todayAttendanceSummaryQuery.data?.presentCount;
  const onLeaveCount = onLeaveTodayQuery.data?.totalElements;
  const pendingCount = pendingLeavesQuery.data?.totalElements;
  const holidaysCount = upcomingHolidaysQuery.data?.totalElements;
  const payrollPending = payrollAwaitingAction?.total;

  return (
    <section aria-label="Workforce summary metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* 1. Total Active Employees */}
      <DashboardStatCard
        helper="Verified active workforce in organization"
        href="/admin/employees"
        icon={Users}
        isError={activeEmployeesQuery.isError}
        isLoading={activeEmployeesQuery.isLoading}
        label="Total active employees"
        tone="primary"
        value={totalActive}
      />

      {/* 2. Present Today */}
      <DashboardStatCard
        helper="Completed standard attendance for today"
        href="/admin/attendance"
        icon={UserCheck}
        isError={todayAttendanceSummaryQuery.isError}
        isLoading={todayAttendanceSummaryQuery.isLoading}
        label="Employees present today"
        tone="success"
        value={presentCount}
      />

      {/* 3. Employees Absent Today (Accurately unavailable per backend data model) */}
      <DashboardStatCard
        helper="Unpunched absences not auto-marked by backend"
        icon={UserX}
        label="Employees absent today"
        tone="neutral"
        unavailable
      />

      {/* 4. Currently On Leave */}
      <DashboardStatCard
        helper="Approved leaves scheduled for today"
        href="/admin/leaves"
        icon={CalendarX2}
        isError={onLeaveTodayQuery.isError}
        isLoading={onLeaveTodayQuery.isLoading}
        label="Employees on leave"
        tone="warning"
        value={onLeaveCount}
      />

      {/* 5. Pending Leave Requests */}
      <DashboardStatCard
        helper="Employee requests awaiting administrator review"
        href="/admin/leaves"
        icon={CalendarDays}
        isError={pendingLeavesQuery.isError}
        isLoading={pendingLeavesQuery.isLoading}
        label="Pending leave requests"
        tone={pendingCount && pendingCount > 0 ? "warning" : "neutral"}
        value={pendingCount}
      />

      {/* 6. Today's Attendance Percentage */}
      <DashboardStatCard
        helper="Calculated from present count vs active workforce"
        icon={Clock3}
        isError={activeEmployeesQuery.isError || todayAttendanceSummaryQuery.isError}
        isLoading={activeEmployeesQuery.isLoading || todayAttendanceSummaryQuery.isLoading}
        label="Today's attendance rate"
        tone="info"
        unavailable={attendanceRate === null}
        value={attendanceRate !== null ? `${attendanceRate}%` : undefined}
      />

      {/* 7. Payroll Awaiting Review or Finalization */}
      <DashboardStatCard
        helper="Draft or reviewed payroll cycles needing action"
        href="/admin/payroll"
        icon={WalletCards}
        isError={payrollDraftQuery.isError || payrollReviewedQuery.isError}
        isLoading={payrollDraftQuery.isLoading || payrollReviewedQuery.isLoading}
        label="Payroll awaiting action"
        tone={payrollPending && payrollPending > 0 ? "warning" : "neutral"}
        value={payrollPending}
      />

      {/* 8. Upcoming Company Holidays */}
      <DashboardStatCard
        helper="Scheduled holidays upcoming from today"
        href="/admin/holidays"
        icon={PartyPopper}
        isError={upcomingHolidaysQuery.isError}
        isLoading={upcomingHolidaysQuery.isLoading}
        label="Upcoming holidays"
        tone="info"
        value={holidaysCount}
      />
    </section>
  );
}

