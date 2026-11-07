import { Bell, CalendarDays, LogIn, Timer } from "lucide-react";

import { DashboardStatCard } from "@/features/dashboard/components/shared/dashboard-stat-card";
import type { useEmployeeDashboard } from "@/features/dashboard/hooks/use-employee-dashboard";
import { formatHoursMinutes, formatTimeShort } from "@/features/dashboard/utils/dashboard-time";

type EmployeeStatCardsProps = {
  dashboard: ReturnType<typeof useEmployeeDashboard>;
};

export function EmployeeStatCards({ dashboard }: EmployeeStatCardsProps) {
  const {
    attendanceStatusQuery,
    leaveBalancesQuery,
    unreadCountQuery,
    totalAvailableLeaveDays,
  } = dashboard;

  const status = attendanceStatusQuery.data;
  const isCheckedIn = Boolean(status?.activeSession);
  const attendance = status?.attendance;
  const workedMinutes = attendance?.totalWorkedMinutes ?? 0;
  const unreadCount = unreadCountQuery.data?.unreadCount ?? 0;

  // Attendance card label & value
  const attendanceStateLabel = isCheckedIn
    ? "Checked In"
    : attendance?.attendanceStatus
      ? attendance.attendanceStatus === "PRESENT"
        ? "Present"
        : attendance.attendanceStatus
      : "Not Checked In";

  const attendanceHelper = isCheckedIn
    ? "Session actively in progress"
    : status?.lastCheckInAt
      ? `Last punch at ${formatTimeShort(status.lastCheckInAt)}`
      : "Ready for check-in punch";

  return (
    <section aria-label="Personal overview metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* 1. Today's Attendance State */}
      <DashboardStatCard
        helper={attendanceHelper}
        href="/employee/attendance"
        icon={LogIn}
        isError={attendanceStatusQuery.isError}
        isLoading={attendanceStatusQuery.isLoading}
        label="Today's attendance"
        tone={isCheckedIn ? "success" : attendance?.attendanceStatus === "PRESENT" ? "success" : "neutral"}
        value={attendanceStateLabel}
      />

      {/* 2. Working Hours Today */}
      <DashboardStatCard
        helper="Verified session duration today"
        href="/employee/attendance"
        icon={Timer}
        isError={attendanceStatusQuery.isError}
        isLoading={attendanceStatusQuery.isLoading}
        label="Hours worked today"
        tone="info"
        value={formatHoursMinutes(workedMinutes)}
      />

      {/* 3. Leave Balance */}
      <DashboardStatCard
        helper="Total available days across allocated leave types"
        href="/employee/leaves"
        icon={CalendarDays}
        isError={leaveBalancesQuery.isError}
        isLoading={leaveBalancesQuery.isLoading}
        label="Available leave balance"
        tone="primary"
        value={totalAvailableLeaveDays !== null ? `${totalAvailableLeaveDays} days` : undefined}
      />

      {/* 4. Unread Notifications */}
      <DashboardStatCard
        helper="Announcements and review alerts"
        href="/employee/notifications"
        icon={Bell}
        isError={unreadCountQuery.isError}
        isLoading={unreadCountQuery.isLoading}
        label="Unread notifications"
        tone={unreadCount > 0 ? "warning" : "neutral"}
        value={unreadCount}
      />
    </section>
  );
}

