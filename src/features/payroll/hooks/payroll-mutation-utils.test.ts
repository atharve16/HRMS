import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { payrollKeys } from "@/features/payroll/hooks/payroll-query-keys";
import {
  synchronizePayrollGeneration,
  synchronizePayrollMutation,
  synchronizeSalaryMutation,
} from "./payroll-mutation-utils";
import type {
  PayrollResponse,
  SalaryStructureResponse,
} from "../types/payroll-types";

describe("payroll-mutation-utils", () => {
  it("synchronizes salary mutation and invalidates active salary and history", () => {
    const queryClient = new QueryClient();
    const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const mockSalary: SalaryStructureResponse = {
      id: "sal-1",
      employeeId: "emp-101",
      monthlyFixedSalary: 75000,
      effectiveFrom: "2026-01-01",
      effectiveTo: null,
      active: true,
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    };

    synchronizeSalaryMutation(queryClient, mockSalary);

    expect(setQueryDataSpy).toHaveBeenCalledWith(
      payrollKeys.salary("emp-101"),
      mockSalary,
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: payrollKeys.salary("emp-101"),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: payrollKeys.salaryHistory("emp-101"),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: payrollKeys.salaries(),
    });
  });

  it("synchronizes draft payroll mutation and invalidates admin lists only", () => {
    const queryClient = new QueryClient();
    const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const mockPayroll: PayrollResponse = {
      id: "pay-1",
      employeeId: "emp-101",
      employeeCodeSnapshot: "EMP001",
      employeeNameSnapshot: "Alice Smith",
      departmentIdSnapshot: "dept-1",
      departmentSnapshot: "Engineering",
      payrollMonth: 10,
      payrollYear: 2026,
      status: "DRAFT",
      monthlyFixedSalarySnapshot: 80000,
      scheduledWorkingDays: 22,
      attendedDays: 20,
      paidLeaveDays: 2,
      unpaidLeaveDays: 0,
      unexcusedAbsenceDays: 0,
      totalUnpaidDays: 0,
      dailySalaryRate: 3636.36,
      salaryDeduction: 0,
      earnings: [],
      deductions: [],
      totalEarnings: 0,
      totalDeductions: 0,
      netSalary: 80000,
      calculationDetails: {
        scheduledDates: [],
        attendedDates: [],
        paidLeaveDates: [],
        unpaidLeaveDates: [],
        unexcusedAbsenceDates: [],
        holidayDates: [],
        weeklyOffDates: [],
        formula: "net = base - ded + adj",
      },
      createdAt: "2026-11-01T00:00:00Z",
      updatedAt: "2026-11-01T00:00:00Z",
      reviewedAt: null,
      reviewedBy: null,
      finalizedAt: null,
      finalizedBy: null,
      paidAt: null,
      paidBy: null,
      version: 1,
    };

    synchronizePayrollMutation(queryClient, mockPayroll);

    expect(setQueryDataSpy).toHaveBeenCalledWith(
      payrollKeys.detail("pay-1"),
      mockPayroll,
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: payrollKeys.adminLists(),
    });
    // Should NOT invalidate employee queries when status is DRAFT
    expect(invalidateQueriesSpy).not.toHaveBeenCalledWith({
      queryKey: payrollKeys.employeeLists(),
    });
  });

  it("synchronizes finalized payroll mutation and invalidates employee queries", () => {
    const queryClient = new QueryClient();
    const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    const mockPayroll: PayrollResponse = {
      id: "pay-2",
      employeeId: "emp-101",
      employeeCodeSnapshot: "EMP001",
      employeeNameSnapshot: "Alice Smith",
      departmentIdSnapshot: "dept-1",
      departmentSnapshot: "Engineering",
      payrollMonth: 10,
      payrollYear: 2026,
      status: "FINALIZED",
      monthlyFixedSalarySnapshot: 80000,
      scheduledWorkingDays: 22,
      attendedDays: 20,
      paidLeaveDays: 2,
      unpaidLeaveDays: 0,
      unexcusedAbsenceDays: 0,
      totalUnpaidDays: 0,
      dailySalaryRate: 3636.36,
      salaryDeduction: 0,
      earnings: [],
      deductions: [],
      totalEarnings: 0,
      totalDeductions: 0,
      netSalary: 80000,
      calculationDetails: {
        scheduledDates: [],
        attendedDates: [],
        paidLeaveDates: [],
        unpaidLeaveDates: [],
        unexcusedAbsenceDates: [],
        holidayDates: [],
        weeklyOffDates: [],
        formula: "net = base - ded + adj",
      },
      createdAt: "2026-11-01T00:00:00Z",
      updatedAt: "2026-11-01T00:00:00Z",
      reviewedAt: "2026-11-02T00:00:00Z",
      reviewedBy: "admin",
      finalizedAt: "2026-11-02T10:00:00Z",
      finalizedBy: "admin",
      paidAt: null,
      paidBy: null,
      version: 2,
    };

    synchronizePayrollMutation(queryClient, mockPayroll);

    expect(setQueryDataSpy).toHaveBeenCalledWith(
      payrollKeys.detail("pay-2"),
      mockPayroll,
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: payrollKeys.adminLists(),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: payrollKeys.employeeLists(),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: payrollKeys.employeeDetail("pay-2"),
    });
  });

  it("synchronizes payroll generation and invalidates admin lists", () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    synchronizePayrollGeneration(queryClient);

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: payrollKeys.adminLists(),
    });
  });
});
