"use client";

import { RefreshCw } from "lucide-react";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdminAttendanceOverview } from "@/features/dashboard/components/admin/admin-attendance-overview";
import { AdminDepartmentDistribution } from "@/features/dashboard/components/admin/admin-department-distribution";
import { AdminPayrollOverview } from "@/features/dashboard/components/admin/admin-payroll-overview";
import { AdminPendingLeaves } from "@/features/dashboard/components/admin/admin-pending-leaves";
import { AdminRecentAttendance } from "@/features/dashboard/components/admin/admin-recent-attendance";
import { AdminRecentEmployees } from "@/features/dashboard/components/admin/admin-recent-employees";
import { AdminStatCards } from "@/features/dashboard/components/admin/admin-stat-cards";
import { AdminUpcomingHolidays } from "@/features/dashboard/components/admin/admin-upcoming-holidays";
import { useAdminDashboard } from "@/features/dashboard/hooks/use-admin-dashboard";
import { cn } from "@/lib/utils";

export default function AdminDashboardPage() {
  const dashboard = useAdminDashboard();

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="flex items-center gap-2">
            <Badge variant="info">Admin workspace</Badge>
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
        description="Real-time workforce intelligence, attendance patterns, pending leaves, and payroll records."
        eyebrow="Admin workspace"
        title="Workforce overview"
      />

      <div className="mt-6 space-y-6">
        {/* 1. Summary metric cards */}
        <AdminStatCards dashboard={dashboard} />

        {/* 2. Attendance Overview and Department Distribution */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AdminAttendanceOverview dashboard={dashboard} />
          <AdminDepartmentDistribution dashboard={dashboard} />
        </div>

        {/* 3. Pending Leaves and Recent Attendance */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AdminPendingLeaves dashboard={dashboard} />
          <AdminRecentAttendance dashboard={dashboard} />
        </div>

        {/* 4. Payroll Overview and Upcoming Holidays / Recent Employees */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AdminPayrollOverview dashboard={dashboard} />
          <div className="space-y-6">
            <AdminUpcomingHolidays dashboard={dashboard} />
            <AdminRecentEmployees dashboard={dashboard} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
