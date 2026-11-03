import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PayrollCard } from "./payroll-card";
import { PayrollTable } from "./payroll-table";
import type { PayrollResponse } from "../types/payroll-types";

const mockPayroll: PayrollResponse = {
  id: "pay-100",
  employeeId: "emp-101",
  employeeCodeSnapshot: "EMP001",
  employeeNameSnapshot: "Alice Smith",
  departmentIdSnapshot: "dept-1",
  departmentSnapshot: "Engineering",
  payrollMonth: 10,
  payrollYear: 2026,
  status: "DRAFT",
  monthlyFixedSalarySnapshot: 120000,
  scheduledWorkingDays: 22,
  attendedDays: 22,
  paidLeaveDays: 0,
  unpaidLeaveDays: 0,
  unexcusedAbsenceDays: 0,
  totalUnpaidDays: 0,
  dailySalaryRate: 5454.55,
  salaryDeduction: 0,
  earnings: [],
  deductions: [],
  totalEarnings: 0,
  totalDeductions: 0,
  netSalary: 120000,
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
  reviewedAt: null,
  reviewedBy: null,
  finalizedAt: null,
  finalizedBy: null,
  paidAt: null,
  paidBy: null,
  createdAt: "2026-11-01T00:00:00Z",
  updatedAt: "2026-11-01T00:00:00Z",
  version: 1,
};

describe("payroll list components", () => {
  it("renders PayrollTable with employee name, period, and amounts", () => {
    const queryClient = new QueryClient();
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <PayrollTable payrolls={[mockPayroll]} />
      </QueryClientProvider>,
    );

    expect(html).toContain("Alice Smith");
    expect(html).toContain("EMP001");
    expect(html).toContain("October 2026");
    expect(html).toContain("Draft");
    expect(html).toContain("22 / 22");
  });

  it("renders PayrollCard with employee details and status badge", () => {
    const queryClient = new QueryClient();
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <PayrollCard payroll={mockPayroll} />
      </QueryClientProvider>,
    );

    expect(html).toContain("Alice Smith");
    expect(html).toContain("EMP001");
    expect(html).toContain("October 2026");
    expect(html).toContain("Draft");
  });
});
