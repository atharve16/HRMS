import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DashboardStatCard } from "@/features/dashboard/components/shared/dashboard-stat-card";
import { AdminAttendanceOverview } from "@/features/dashboard/components/admin/admin-attendance-overview";
import { AdminDepartmentDistribution } from "@/features/dashboard/components/admin/admin-department-distribution";
import { AdminPayrollOverview } from "@/features/dashboard/components/admin/admin-payroll-overview";
import { AdminPendingLeaves } from "@/features/dashboard/components/admin/admin-pending-leaves";
import { AdminRecentAttendance } from "@/features/dashboard/components/admin/admin-recent-attendance";
import { AdminRecentEmployees } from "@/features/dashboard/components/admin/admin-recent-employees";
import { AdminStatCards } from "@/features/dashboard/components/admin/admin-stat-cards";
import { AdminUpcomingHolidays } from "@/features/dashboard/components/admin/admin-upcoming-holidays";
import { EmployeeAttendanceHero } from "@/features/dashboard/components/employee/employee-attendance-hero";
import { EmployeeLatestPayroll } from "@/features/dashboard/components/employee/employee-latest-payroll";
import { EmployeeLeaveBalances } from "@/features/dashboard/components/employee/employee-leave-balances";
import { EmployeeNotificationsWidget } from "@/features/dashboard/components/employee/employee-notifications-widget";
import { EmployeeRecentAttendance } from "@/features/dashboard/components/employee/employee-recent-attendance";
import { EmployeeRecentLeaves } from "@/features/dashboard/components/employee/employee-recent-leaves";
import { EmployeeStatCards } from "@/features/dashboard/components/employee/employee-stat-cards";
import { EmployeeUpcomingHolidays } from "@/features/dashboard/components/employee/employee-upcoming-holidays";

import { useAdminDashboard } from "@/features/dashboard/hooks/use-admin-dashboard";
import { useEmployeeDashboard } from "@/features/dashboard/hooks/use-employee-dashboard";

function createMockAdminDashboard(overrides: Record<string, unknown> = {}) {
  return {
    today: "2026-11-07",
    activeEmployeesQuery: {
      data: { totalElements: 50, content: [] },
      isLoading: false,
      isError: false,
    },
    todayAttendanceSummaryQuery: {
      data: {
        totalRecords: 42,
        presentCount: 38,
        partialCount: 3,
        incompleteCount: 1,
        totalWorkedMinutes: 18240,
        totalLateMinutes: 45,
        totalEarlyDepartureMinutes: 15,
        totalOvertimeMinutes: 120,
      },
      isLoading: false,
      isError: false,
    },
    onLeaveTodayQuery: {
      data: { totalElements: 4 },
      isLoading: false,
      isError: false,
    },
    pendingLeavesQuery: {
      data: {
        totalElements: 2,
        content: [
          {
            id: "leave-1",
            employeeId: "emp-1",
            employeeCode: "EMP001",
            leaveType: "CL",
            startDate: "2026-11-10",
            endDate: "2026-11-11",
            totalDays: 2,
            status: "PENDING",
            reason: "Personal appointment",
            adminRemarks: null,
          },
        ],
      },
      isLoading: false,
      isError: false,
    },
    upcomingHolidaysQuery: {
      data: {
        totalElements: 1,
        content: [
          {
            id: "hol-1",
            name: "Diwali",
            date: "2026-11-12",
            description: "Festival of Lights",
            active: true,
          },
        ],
      },
      isLoading: false,
      isError: false,
    },
    payrollDraftQuery: {
      data: { totalItems: 2 },
      isLoading: false,
      isError: false,
    },
    payrollReviewedQuery: {
      data: { totalItems: 1 },
      isLoading: false,
      isError: false,
    },
    payrollFinalizedQuery: {
      data: { totalItems: 45 },
      isLoading: false,
      isError: false,
    },
    payrollPaidQuery: {
      data: { totalItems: 40 },
      isLoading: false,
      isError: false,
    },
    payrollAwaitingAction: { draft: 2, reviewed: 1, total: 3 },
    recentPayrollQuery: {
      data: {
        items: [
          {
            id: "pay-1",
            employeeCodeSnapshot: "EMP001",
            employeeNameSnapshot: "John Doe",
            payrollMonth: 10,
            payrollYear: 2026,
            netSalary: 85000,
            status: "FINALIZED",
          },
        ],
      },
      isLoading: false,
      isError: false,
    },
    recentAttendanceQuery: {
      data: {
        content: [
          {
            id: "att-1",
            employeeNameSnapshot: "John Doe",
            employeeCodeSnapshot: "EMP001",
            workDate: "2026-11-07",
            attendanceStatus: "PRESENT",
            sessions: [
              { checkInAt: "2026-11-07T03:30:00Z", checkOutAt: "2026-11-07T11:30:00Z", status: "COMPLETED" },
            ],
            totalWorkedMinutes: 480,
          },
        ],
      },
      isLoading: false,
      isError: false,
    },
    recentEmployeesQuery: {
      data: {
        content: [
          {
            id: "emp-1",
            firstName: "Jane",
            lastName: "Smith",
            employeeCode: "EMP002",
            designation: "Frontend Engineer",
            joiningDate: "2026-11-01",
            employmentStatus: "ACTIVE",
          },
        ],
      },
      isLoading: false,
      isError: false,
    },
    departmentsQuery: {
      data: {
        content: [
          { id: "dept-1", departmentCode: "ENG", name: "Engineering" },
        ],
      },
      isLoading: false,
      isError: false,
    },
    departmentDistribution: [
      {
        departmentId: "dept-1",
        departmentCode: "ENG",
        name: "Engineering",
        employeeCount: 35,
        percentage: 70,
      },
    ],
    isDepartmentCountsLoading: false,
    attendanceRate: 76,
    isRefreshing: false,
    refreshAll: async () => {},
    ...overrides,
  } as unknown as ReturnType<typeof useAdminDashboard>;
}

function createMockEmployeeDashboard(overrides: Record<string, unknown> = {}) {
  return {
    today: "2026-11-07",
    attendanceStatusQuery: {
      data: {
        activeSession: true,
        attendance: {
          id: "att-me-1",
          workDate: "2026-11-07",
          attendanceStatus: "PRESENT",
          totalWorkedMinutes: 240,
          sessions: [
            {
              sessionId: "sess-1",
              checkInAt: "2026-11-07T03:30:00Z",
              checkOutAt: null,
              status: "OPEN",
            },
          ],
        },
        lastCheckInAt: "2026-11-07T03:30:00Z",
      },
      isLoading: false,
      isError: false,
      refetch: async () => {},
    },
    leaveBalancesQuery: {
      data: [
        {
          id: "bal-1",
          employeeId: "me",
          leaveType: "CL",
          leaveTypeName: "Casual Leave",
          year: 2026,
          allocatedDays: 12,
          usedDays: 4,
          pendingDays: 1,
          availableDays: 7,
        },
      ],
      isLoading: false,
      isError: false,
    },
    attendanceHistoryQuery: {
      data: {
        content: [
          {
            id: "hist-1",
            workDate: "2026-11-06",
            attendanceStatus: "PRESENT",
            totalWorkedMinutes: 480,
            sessions: [
              { checkInAt: "2026-11-06T03:30:00Z", checkOutAt: "2026-11-06T11:30:00Z" },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
    },
    myLeavesQuery: {
      data: {
        content: [
          {
            id: "myleave-1",
            leaveType: "CL",
            startDate: "2026-11-15",
            endDate: "2026-11-16",
            totalDays: 2,
            status: "APPROVED",
            adminRemarks: "Approved by manager",
          },
        ],
      },
      isLoading: false,
      isError: false,
    },
    upcomingHolidaysQuery: {
      data: [
        {
          id: "hol-emp-1",
          name: "Diwali",
          date: "2026-11-12",
          description: "Festival of Lights",
        },
      ],
      isLoading: false,
      isError: false,
    },
    notificationsQuery: {
      data: {
        content: [
          {
            id: "notif-1",
            title: "Leave Approved",
            message: "Your casual leave has been approved.",
            isRead: false,
            createdAt: "2026-11-07T04:00:00Z",
          },
        ],
      },
      isLoading: false,
      isError: false,
    },
    unreadCountQuery: {
      data: { unreadCount: 1 },
      isLoading: false,
      isError: false,
    },
    latestPayrollQuery: {
      data: {
        items: [
          {
            id: "pay-me-1",
            payrollMonth: 10,
            payrollYear: 2026,
            netSalary: 95000,
            attendedDays: 22,
            status: "PAID",
            paidAt: "2026-11-05T00:00:00Z",
          },
        ],
      },
      isLoading: false,
      isError: false,
    },
    totalAvailableLeaveDays: 7,
    latestPayroll: {
      id: "pay-me-1",
      payrollMonth: 10,
      payrollYear: 2026,
      netSalary: 95000,
      attendedDays: 22,
      status: "PAID" as const,
      paidAt: "2026-11-05T00:00:00Z",
    },
    isRefreshing: false,
    refreshAll: async () => {},
    ...overrides,
  } as unknown as ReturnType<typeof useEmployeeDashboard>;
}

describe("Dashboard UI components rendering", () => {
  it("renders DashboardStatCard in normal, loading, error, and unavailable states", () => {
    // 1. Normal state
    const normalHtml = renderToStaticMarkup(
      <DashboardStatCard
        helper="Verified workforce count"
        icon={Users}
        label="Total employees"
        value="50"
      />,
    );
    expect(normalHtml).toContain("Total employees");
    expect(normalHtml).toContain("50");
    expect(normalHtml).toContain("Verified workforce count");

    // 2. Loading state
    const loadingHtml = renderToStaticMarkup(
      <DashboardStatCard
        helper="Loading data"
        icon={Users}
        isLoading
        label="Total employees"
      />,
    );
    expect(loadingHtml).toContain("animate-pulse");
    expect(loadingHtml).not.toContain("50");

    // 3. Error state - never fake 0
    const errorHtml = renderToStaticMarkup(
      <DashboardStatCard
        helper="Failed load"
        icon={Users}
        isError
        label="Total employees"
      />,
    );
    expect(errorHtml).toContain("Failed to load");
    expect(errorHtml).not.toContain(">0<");

    // 4. Unavailable state (e.g. absent count)
    const unavailableHtml = renderToStaticMarkup(
      <DashboardStatCard
        helper="Unpunched absences not tracked"
        icon={Users}
        label="Employees absent today"
        unavailable
      />,
    );
    expect(unavailableHtml).toContain("Unavailable");
  });

  it("renders AdminStatCards with accurate backend metrics and honest absent status", () => {
    const dashboard = createMockAdminDashboard();
    const html = renderToStaticMarkup(<AdminStatCards dashboard={dashboard} />);

    expect(html).toContain("Total active employees");
    expect(html).toContain("50");
    expect(html).toContain("Employees present today");
    expect(html).toContain("38");
    expect(html).toContain("Employees absent today");
    expect(html).toContain("Unavailable");
    expect(html).toContain("Employees on leave");
    expect(html).toContain("4");
    expect(html).toContain("Pending leave requests");
    expect(html).toContain("2");
    expect(html).toContain("attendance rate");
    expect(html).toContain("76%");
    expect(html).toContain("Payroll awaiting action");
    expect(html).toContain("3");
    expect(html).toContain("Upcoming holidays");
    expect(html).toContain("1");
  });

  it("renders AdminAttendanceOverview with live breakdown and telemetry", () => {
    const dashboard = createMockAdminDashboard();
    const html = renderToStaticMarkup(
      <AdminAttendanceOverview dashboard={dashboard} />,
    );

    expect(html).toContain("Attendance overview");
    expect(html).toContain("Present");
    expect(html).toContain("38");
    expect(html).toContain("Partial Shift");
    expect(html).toContain("3");
    expect(html).toContain("Incomplete");
    expect(html).toContain("1");
    expect(html).toContain("Approved Leave");
    expect(html).toContain("4");
    expect(html).toContain("View live roster");
  });

  it("renders AdminAttendanceOverview empty state honestly when no punches exist", () => {
    const dashboard = createMockAdminDashboard({
      todayAttendanceSummaryQuery: {
        data: {
          totalRecords: 0,
          presentCount: 0,
          partialCount: 0,
          incompleteCount: 0,
          totalWorkedMinutes: 0,
          totalLateMinutes: 0,
          totalEarlyDepartureMinutes: 0,
          totalOvertimeMinutes: 0,
        },
        isLoading: false,
        isError: false,
      },
      onLeaveTodayQuery: {
        data: { totalElements: 0 },
        isLoading: false,
        isError: false,
      },
    });

    const html = renderToStaticMarkup(
      <AdminAttendanceOverview dashboard={dashboard} />,
    );
    expect(html).toContain("No punches recorded yet today");
  });

  it("renders AdminDepartmentDistribution with calculated shares and unassigned", () => {
    const dashboard = createMockAdminDashboard();
    const html = renderToStaticMarkup(
      <AdminDepartmentDistribution dashboard={dashboard} />,
    );

    expect(html).toContain("Department distribution");
    expect(html).toContain("Engineering");
    expect(html).toContain("(ENG)");
    expect(html).toContain("35 members (70%)");
    expect(html).toContain("Unassigned / General");
    expect(html).toContain("15 members (30%)");
  });

  it("renders AdminPendingLeaves with requests table", () => {
    const dashboard = createMockAdminDashboard();
    const html = renderToStaticMarkup(<AdminPendingLeaves dashboard={dashboard} />);

    expect(html).toContain("Pending leave requests");
    expect(html).toContain("EMP001");
    expect(html).toContain("Casual Leave");
    expect(html).toContain("2 days");
    expect(html).toContain("Pending");
  });

  it("renders AdminRecentAttendance with punch records", () => {
    const dashboard = createMockAdminDashboard();
    const html = renderToStaticMarkup(
      <AdminRecentAttendance dashboard={dashboard} />,
    );

    expect(html).toContain("Recent attendance activity");
    expect(html).toContain("John Doe");
    expect(html).toContain("EMP001");
    expect(html).toContain("Present");
    expect(html).toContain("8h");
  });

  it("renders AdminPayrollOverview with lifecycle counts and recent records", () => {
    const dashboard = createMockAdminDashboard();
    const html = renderToStaticMarkup(<AdminPayrollOverview dashboard={dashboard} />);

    expect(html).toContain("Payroll lifecycle overview");
    expect(html).toContain("Draft");
    expect(html).toContain("Reviewed");
    expect(html).toContain("Finalized");
    expect(html).toContain("Paid");
    expect(html).toContain("John Doe");
    expect(html).toContain("October 2026");
  });

  it("renders AdminRecentEmployees with avatars and joining dates", () => {
    const dashboard = createMockAdminDashboard();
    const html = renderToStaticMarkup(
      <AdminRecentEmployees dashboard={dashboard} />,
    );

    expect(html).toContain("Recently added employees");
    expect(html).toContain("Jane Smith");
    expect(html).toContain("EMP002");
    expect(html).toContain("Frontend Engineer");
    expect(html).toContain("Active");
  });

  it("renders AdminUpcomingHolidays with holiday info", () => {
    const dashboard = createMockAdminDashboard();
    const html = renderToStaticMarkup(
      <AdminUpcomingHolidays dashboard={dashboard} />,
    );

    expect(html).toContain("Upcoming holidays");
    expect(html).toContain("Diwali");
    expect(html).toContain("Festival of Lights");
  });

  it("renders EmployeeAttendanceHero when checked in with open session", () => {
    const queryClient = new QueryClient();
    const dashboard = createMockEmployeeDashboard();
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <EmployeeAttendanceHero dashboard={dashboard} />
      </QueryClientProvider>,
    );

    expect(html).toContain("You are currently checked in");
    expect(html).toContain("Active session in progress");
    expect(html).toContain("Check Out");
  });

  it("renders EmployeeAttendanceHero when idle with Check In button", () => {
    const queryClient = new QueryClient();
    const dashboard = createMockEmployeeDashboard({
      attendanceStatusQuery: {
        data: {
          activeSession: false,
          attendance: null,
          lastCheckInAt: null,
        },
        isLoading: false,
        isError: false,
      },
    });
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <EmployeeAttendanceHero dashboard={dashboard} />
      </QueryClientProvider>,
    );

    expect(html).toContain("Ready to start your work session?");
    expect(html).toContain("Session idle");
    expect(html).toContain("Check In");
  });

  it("renders EmployeeStatCards with personal metrics", () => {
    const dashboard = createMockEmployeeDashboard();
    const html = renderToStaticMarkup(<EmployeeStatCards dashboard={dashboard} />);

    expect(html).toContain("attendance");
    expect(html).toContain("Checked In");
    expect(html).toContain("Hours worked today");
    expect(html).toContain("4h");
    expect(html).toContain("Available leave balance");
    expect(html).toContain("7 days");
    expect(html).toContain("Unread notifications");
    expect(html).toContain("1");
  });

  it("renders EmployeeLeaveBalances with balance details", () => {
    const dashboard = createMockEmployeeDashboard();
    const html = renderToStaticMarkup(
      <EmployeeLeaveBalances dashboard={dashboard} />,
    );

    expect(html).toContain("Leave balances");
    expect(html).toContain("Casual Leave");
    expect(html).toContain("12");
    expect(html).toContain("4");
    expect(html).toContain("7");
  });

  it("renders EmployeeRecentAttendance with history records", () => {
    const dashboard = createMockEmployeeDashboard();
    const html = renderToStaticMarkup(
      <EmployeeRecentAttendance dashboard={dashboard} />,
    );

    expect(html).toContain("Recent attendance");
    expect(html).toContain("8h");
    expect(html).toContain("Present");
  });

  it("renders EmployeeRecentLeaves with applications and remarks", () => {
    const dashboard = createMockEmployeeDashboard();
    const html = renderToStaticMarkup(<EmployeeRecentLeaves dashboard={dashboard} />);

    expect(html).toContain("Recent leave applications");
    expect(html).toContain("Casual Leave");
    expect(html).toContain("2 days");
    expect(html).toContain("Approved by manager");
  });

  it("renders EmployeeUpcomingHolidays for employee", () => {
    const dashboard = createMockEmployeeDashboard();
    const html = renderToStaticMarkup(
      <EmployeeUpcomingHolidays dashboard={dashboard} />,
    );

    expect(html).toContain("Upcoming holidays");
    expect(html).toContain("Diwali");
  });

  it("renders EmployeeNotificationsWidget with unread badge and messages", () => {
    const queryClient = new QueryClient();
    const dashboard = createMockEmployeeDashboard();
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <EmployeeNotificationsWidget dashboard={dashboard} />
      </QueryClientProvider>,
    );

    expect(html).toContain("Notifications");
    expect(html).toContain("1 unread");
    expect(html).toContain("Leave Approved");
    expect(html).toContain("Your casual leave has been approved.");
  });

  it("renders EmployeeLatestPayroll with payslip details", () => {
    const dashboard = createMockEmployeeDashboard();
    const html = renderToStaticMarkup(
      <EmployeeLatestPayroll dashboard={dashboard} />,
    );

    expect(html).toContain("Latest payroll");
    expect(html).toContain("October 2026");
    expect(html).toContain("22 days");
    expect(html).toContain("Paid");
    expect(html).toContain("View full payslip breakdown");
  });

  it("renders EmployeeLatestPayroll empty state when no payslips exist", () => {
    const dashboard = createMockEmployeeDashboard({
      latestPayroll: null,
      latestPayrollQuery: {
        data: { items: [] },
        isLoading: false,
        isError: false,
      },
    });
    const html = renderToStaticMarkup(
      <EmployeeLatestPayroll dashboard={dashboard} />,
    );

    expect(html).toContain("No finalized payslips available");
  });
});
