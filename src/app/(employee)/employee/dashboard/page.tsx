"use client";

import { RefreshCw } from "lucide-react";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmployeeAttendanceHero } from "@/features/dashboard/components/employee/employee-attendance-hero";
import { EmployeeLatestPayroll } from "@/features/dashboard/components/employee/employee-latest-payroll";
import { EmployeeLeaveBalances } from "@/features/dashboard/components/employee/employee-leave-balances";
import { EmployeeNotificationsWidget } from "@/features/dashboard/components/employee/employee-notifications-widget";
import { EmployeeRecentAttendance } from "@/features/dashboard/components/employee/employee-recent-attendance";
import { EmployeeRecentLeaves } from "@/features/dashboard/components/employee/employee-recent-leaves";
import { EmployeeStatCards } from "@/features/dashboard/components/employee/employee-stat-cards";
import { EmployeeUpcomingHolidays } from "@/features/dashboard/components/employee/employee-upcoming-holidays";
import { useEmployeeDashboard } from "@/features/dashboard/hooks/use-employee-dashboard";
import { cn } from "@/lib/utils";

export default function EmployeeDashboardPage() {
  const dashboard = useEmployeeDashboard();

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="info">Employee workspace</Badge>
            <Button
              className="h-8 gap-1.5 px-3 text-xs"
              disabled={dashboard.isRefreshing}
              onClick={() => dashboard.refreshAll()}
              size="sm"
              type="button"
              variant="outline"
            >
              <RefreshCw
                aria-hidden="true"
                className={cn("size-3.5", dashboard.isRefreshing && "animate-spin text-primary")}
              />
              <span>{dashboard.isRefreshing ? "Refreshing..." : "Refresh"}</span>
            </Button>
          </div>
        }
        description="Your daily attendance, time summary, leave balances, and recent work activity."
        eyebrow="Employee workspace"
        title="Your workday overview"
      />

      <div className="mt-6 space-y-6">
        {/* 1. Quick Check In / Check Out & Active Status Punch Hero */}
        <EmployeeAttendanceHero dashboard={dashboard} />

        {/* 2. Key Personal Stat Cards */}
        <EmployeeStatCards dashboard={dashboard} />

        {/* 3. Leave Balances and Latest Payroll Statement */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <EmployeeLeaveBalances dashboard={dashboard} />
          <EmployeeLatestPayroll dashboard={dashboard} />
        </div>

        {/* 4. Recent Attendance Log and Leave Applications */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <EmployeeRecentAttendance dashboard={dashboard} />
          <EmployeeRecentLeaves dashboard={dashboard} />
        </div>

        {/* 5. Upcoming Company Holidays and Notification Feed */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <EmployeeUpcomingHolidays dashboard={dashboard} />
          <EmployeeNotificationsWidget dashboard={dashboard} />
        </div>
      </div>
    </PageContainer>
  );
}
