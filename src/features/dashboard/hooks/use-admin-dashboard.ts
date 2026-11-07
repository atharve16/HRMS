"use client";

import { useQueries } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";

import {
  useAdminAttendance,
  useAdminAttendanceSummary,
} from "@/features/attendance/hooks/use-attendance";
import { useDepartments } from "@/features/departments/hooks/use-departments";
import { employeesQueryOptions, useEmployees } from "@/features/employees/hooks/use-employees";
import { useAdminHolidays } from "@/features/holidays/hooks/use-holidays";
import { useAdminLeaves } from "@/features/leaves/hooks/use-leaves";
import { useAdminPayrolls } from "@/features/payroll/hooks/use-payroll";
import { getCompanyTodayDate } from "@/features/dashboard/utils/dashboard-time";
import type { DepartmentDistributionItem } from "@/features/dashboard/types/dashboard-types";

export function useAdminDashboard() {
  const [today] = useState(() => getCompanyTodayDate());

  // 1. Total active employees count
  const activeEmployeesQuery = useEmployees({
    employmentStatus: "ACTIVE",
    page: 0,
    limit: 1,
  });

  // 2. Today's attendance summary (Present, Partial, Incomplete, minutes)
  const todayAttendanceSummaryQuery = useAdminAttendanceSummary({
    fromDate: today,
    toDate: today,
  });

  // 3. Employees currently on leave today (approved leave overlapping today)
  const onLeaveTodayQuery = useAdminLeaves({
    status: "APPROVED",
    fromDate: today,
    toDate: today,
    page: 0,
    limit: 1,
  });

  // 4. Pending leave requests awaiting admin review
  const pendingLeavesQuery = useAdminLeaves({
    status: "PENDING",
    page: 0,
    limit: 5,
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  // 5. Upcoming active holidays from today forward
  const upcomingHolidaysQuery = useAdminHolidays({
    active: true,
    fromDate: today,
    page: 0,
    limit: 5,
    sortDirection: "asc",
  });

  // 6. Payroll lifecycle totals (server-side total counts via limit=1)
  const payrollDraftQuery = useAdminPayrolls({
    status: "DRAFT",
    page: 0,
    limit: 1,
  });
  const payrollReviewedQuery = useAdminPayrolls({
    status: "REVIEWED",
    page: 0,
    limit: 1,
  });
  const payrollFinalizedQuery = useAdminPayrolls({
    status: "FINALIZED",
    page: 0,
    limit: 1,
  });
  const payrollPaidQuery = useAdminPayrolls({
    status: "PAID",
    page: 0,
    limit: 1,
  });

  // 7. Recent payroll records
  const recentPayrollQuery = useAdminPayrolls({
    page: 0,
    limit: 5,
    sortDirection: "desc",
  });

  // 8. Recent attendance activity
  const recentAttendanceQuery = useAdminAttendance({
    page: 0,
    limit: 5,
    sortBy: "workDate",
    sortDirection: "desc",
  });

  // 9. Recently added employees
  const recentEmployeesQuery = useEmployees({
    page: 0,
    limit: 5,
    sortBy: "createdAt",
    sortDirection: "desc",
  });

  // 10. Active departments
  const departmentsQuery = useDepartments({
    status: "ACTIVE",
    page: 0,
    limit: 20,
  });

  // Query employee count for each active department in parallel
  const departmentsList = useMemo(
    () => departmentsQuery.data?.content ?? [],
    [departmentsQuery.data?.content],
  );

  const departmentCountQueries = useQueries({
    queries: departmentsList.map((dept) =>
      employeesQueryOptions({
        departmentId: dept.id,
        employmentStatus: "ACTIVE",
        page: 0,
        limit: 1,
      }),
    ),
  });

  // Compute department distribution items
  const departmentDistribution = useMemo<DepartmentDistributionItem[]>(() => {
    const totalActive = activeEmployeesQuery.data?.totalElements ?? 0;
    return departmentsList.map((dept, index) => {
      const count = departmentCountQueries[index]?.data?.totalElements ?? 0;
      const percentage =
        totalActive > 0 ? Math.round((count / totalActive) * 100 * 10) / 10 : 0;
      return {
        departmentId: dept.id,
        departmentCode: dept.departmentCode,
        name: dept.name,
        employeeCount: count,
        percentage,
      };
    });
  }, [
    activeEmployeesQuery.data?.totalElements,
    departmentCountQueries,
    departmentsList,
  ]);

  const isDepartmentCountsLoading =
    departmentsQuery.isLoading ||
    departmentCountQueries.some((q) => q.isLoading);

  // Derived attendance percentage: (presentCount / totalActiveEmployees) * 100
  const attendanceRate = useMemo(() => {
    const total = activeEmployeesQuery.data?.totalElements;
    const present = todayAttendanceSummaryQuery.data?.presentCount;
    if (total === undefined || present === undefined || total <= 0) return null;
    return Math.min(100, Math.round((present / total) * 100 * 10) / 10);
  }, [
    activeEmployeesQuery.data?.totalElements,
    todayAttendanceSummaryQuery.data?.presentCount,
  ]);

  // Derived payroll awaiting action: DRAFT + REVIEWED
  const payrollAwaitingAction = useMemo(() => {
    const draft = payrollDraftQuery.data?.totalItems;
    const reviewed = payrollReviewedQuery.data?.totalItems;
    if (draft === undefined && reviewed === undefined) return null;
    return {
      draft: draft ?? 0,
      reviewed: reviewed ?? 0,
      total: (draft ?? 0) + (reviewed ?? 0),
    };
  }, [payrollDraftQuery.data?.totalItems, payrollReviewedQuery.data?.totalItems]);

  // Check if any critical query is currently fetching/refetching
  const isRefreshing =
    activeEmployeesQuery.isFetching ||
    todayAttendanceSummaryQuery.isFetching ||
    onLeaveTodayQuery.isFetching ||
    pendingLeavesQuery.isFetching ||
    upcomingHolidaysQuery.isFetching ||
    payrollDraftQuery.isFetching ||
    payrollReviewedQuery.isFetching ||
    recentAttendanceQuery.isFetching ||
    recentPayrollQuery.isFetching ||
    recentEmployeesQuery.isFetching;

  const refreshAll = useCallback(async () => {
    await Promise.all([
      activeEmployeesQuery.refetch(),
      todayAttendanceSummaryQuery.refetch(),
      onLeaveTodayQuery.refetch(),
      pendingLeavesQuery.refetch(),
      upcomingHolidaysQuery.refetch(),
      payrollDraftQuery.refetch(),
      payrollReviewedQuery.refetch(),
      payrollFinalizedQuery.refetch(),
      payrollPaidQuery.refetch(),
      recentPayrollQuery.refetch(),
      recentAttendanceQuery.refetch(),
      recentEmployeesQuery.refetch(),
      departmentsQuery.refetch(),
      ...departmentCountQueries.map((q) => q.refetch()),
    ]);
  }, [
    activeEmployeesQuery,
    todayAttendanceSummaryQuery,
    onLeaveTodayQuery,
    pendingLeavesQuery,
    upcomingHolidaysQuery,
    payrollDraftQuery,
    payrollReviewedQuery,
    payrollFinalizedQuery,
    payrollPaidQuery,
    recentPayrollQuery,
    recentAttendanceQuery,
    recentEmployeesQuery,
    departmentsQuery,
    departmentCountQueries,
  ]);

  return {
    today,
    activeEmployeesQuery,
    todayAttendanceSummaryQuery,
    onLeaveTodayQuery,
    pendingLeavesQuery,
    upcomingHolidaysQuery,
    payrollDraftQuery,
    payrollReviewedQuery,
    payrollFinalizedQuery,
    payrollPaidQuery,
    payrollAwaitingAction,
    recentPayrollQuery,
    recentAttendanceQuery,
    recentEmployeesQuery,
    departmentsQuery,
    departmentDistribution,
    isDepartmentCountsLoading,
    attendanceRate,
    isRefreshing,
    refreshAll,
  };
}

