"use client";

import {
  ArrowLeft,
  Building2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { PageContainer } from "@/components/layouts/page-container";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  PayrollErrorState,
  PayrollSkeleton,
} from "@/features/payroll/components/payroll-query-state";
import { PayrollStatusBadge } from "@/features/payroll/components/payroll-status-badge";
import { useEmployeePayrollDetail } from "@/features/payroll/hooks/use-payroll";
import {
  ADJUSTMENT_TYPE_LABELS,
  formatCurrency,
  formatPayrollPeriod,
} from "@/features/payroll/utils/payroll-display";
import { getPayrollErrorMessage } from "@/features/payroll/utils/payroll-errors";

export function EmployeePayrollDetailScreen({
  payrollId: propPayrollId,
}: { payrollId?: string } = {}) {
  const routeParams = useParams<{ payrollId: string }>();
  const payrollId = propPayrollId || routeParams?.payrollId || "";

  const {
    data: payroll,
    isLoading,
    isError,
    error,
    refetch,
  } = useEmployeePayrollDetail(payrollId);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Link
            className={buttonVariants({ variant: "ghost", size: "sm" })}
            href="/employee/payroll"
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Back to payslips
          </Link>
          <PayrollSkeleton />
        </div>
      </PageContainer>
    );
  }

  if (isError || !payroll) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Link
            className={buttonVariants({ variant: "ghost", size: "sm" })}
            href="/employee/payroll"
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Back to payslips
          </Link>
          <PayrollErrorState
            message={getPayrollErrorMessage(error)}
            retry={() => refetch()}
          />
        </div>
      </PageContainer>
    );
  }

  const periodLabel = formatPayrollPeriod(payroll.payrollMonth, payroll.payrollYear);
  const payableDays = payroll.attendedDays + payroll.paidLeaveDays;
  const totalGrossEarnings = payroll.monthlyFixedSalary + payroll.totalEarnings;
  const totalDeductions = payroll.salaryDeduction + payroll.totalDeductions;

  return (
    <PageContainer>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Navigation */}
        <div>
          <Link
            className={buttonVariants({ variant: "ghost", size: "sm" })}
            href="/employee/payroll"
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Back to payslips
          </Link>
        </div>

        {/* Payslip Document Container */}
        <Card className="border border-border bg-card shadow-sm overflow-hidden">
          {/* Document Header */}
          <div className="border-b border-border bg-muted/30 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-primary font-bold text-xl">
                <Building2 className="size-6" />
                <span>HRMS Enterprise</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Official Monthly Salary Payslip
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs text-muted-foreground block">Pay Period</span>
              <p className="text-lg font-bold text-foreground">{periodLabel}</p>
              <div className="mt-1">
                <PayrollStatusBadge status={payroll.status} />
              </div>
            </div>
          </div>

          <CardContent className="p-6 space-y-6">
            {/* Employee Summary Card */}
            <div className="rounded-xl border border-border bg-muted/10 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-muted-foreground block">Employee Name</span>
                  <p className="font-semibold text-foreground mt-0.5 text-sm">
                    {payroll.employeeName || "Employee"}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block">Employee Code</span>
                  <p className="font-mono font-medium text-foreground mt-0.5 text-sm">
                    {payroll.employeeCode}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block">Department</span>
                  <p className="font-medium text-foreground mt-0.5 text-sm">
                    {payroll.department || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Attendance Days Summary */}
            <div className="rounded-xl border border-border p-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Attendance & Working Days Summary
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-muted/30 p-2.5 rounded-lg">
                  <span className="text-muted-foreground block">Scheduled Work Days</span>
                  <span className="font-mono font-bold text-foreground text-sm">
                    {payroll.scheduledWorkingDays}
                  </span>
                </div>
                <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-lg">
                  <span className="text-emerald-700 dark:text-emerald-400 block">Attended Days</span>
                  <span className="font-mono font-bold text-emerald-800 dark:text-emerald-300 text-sm">
                    {payroll.attendedDays}
                  </span>
                </div>
                <div className="bg-sky-50/50 dark:bg-sky-950/20 p-2.5 rounded-lg">
                  <span className="text-sky-700 dark:text-sky-400 block">Paid Approved Leaves</span>
                  <span className="font-mono font-bold text-sky-800 dark:text-sky-300 text-sm">
                    {payroll.paidLeaveDays}
                  </span>
                </div>
                <div className="bg-primary/5 p-2.5 rounded-lg">
                  <span className="text-primary block font-medium">Total Payable Days</span>
                  <span className="font-mono font-bold text-primary text-sm">
                    {payableDays}
                  </span>
                </div>
              </div>
            </div>

            {/* Breakdown of Earnings vs Deductions */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Earnings Column */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-emerald-50/60 dark:bg-emerald-950/30 px-4 py-2.5 border-b border-border font-semibold text-sm text-emerald-800 dark:text-emerald-300 flex justify-between">
                  <span>Earnings & Allowances</span>
                  <span>Amount</span>
                </div>
                <div className="p-4 space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <div>
                      <p className="font-medium text-foreground">Monthly Fixed Base</p>
                      <span className="text-[11px] text-muted-foreground">Contractual Base</span>
                    </div>
                    <span className="font-mono font-medium text-foreground">
                      {formatCurrency(payroll.monthlyFixedSalary)}
                    </span>
                  </div>

                  {payroll.earnings.map((e, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-1 border-b border-border/40"
                    >
                      <div>
                        <p className="font-medium text-foreground">{e.description}</p>
                        <span className="text-[11px] text-muted-foreground">
                          {ADJUSTMENT_TYPE_LABELS[e.type] ?? e.type}
                        </span>
                      </div>
                      <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(e.amount)}
                      </span>
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-2 font-semibold text-sm text-foreground">
                    <span>Total Gross Earnings:</span>
                    <span className="font-mono">{formatCurrency(totalGrossEarnings)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions Column */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="bg-rose-50/60 dark:bg-rose-950/30 px-4 py-2.5 border-b border-border font-semibold text-sm text-rose-800 dark:text-rose-300 flex justify-between">
                  <span>Deductions</span>
                  <span>Amount</span>
                </div>
                <div className="p-4 space-y-3 text-xs">
                  <div className="flex justify-between items-center py-1 border-b border-border/40">
                    <div>
                      <p className="font-medium text-foreground">Attendance Deductions</p>
                      <span className="text-[11px] text-muted-foreground">
                        {payroll.totalUnpaidDays} unpaid / unexcused day(s)
                      </span>
                    </div>
                    <span className="font-mono font-medium text-rose-600 dark:text-rose-400">
                      -{formatCurrency(payroll.salaryDeduction)}
                    </span>
                  </div>

                  {payroll.deductions.map((d, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center py-1 border-b border-border/40"
                    >
                      <div>
                        <p className="font-medium text-foreground">{d.description}</p>
                        <span className="text-[11px] text-muted-foreground">
                          {ADJUSTMENT_TYPE_LABELS[d.type] ?? d.type}
                        </span>
                      </div>
                      <span className="font-mono font-medium text-rose-600 dark:text-rose-400">
                        -{formatCurrency(d.amount)}
                      </span>
                    </div>
                  ))}

                  <div className="flex justify-between items-center pt-2 font-semibold text-sm text-foreground">
                    <span>Total Deductions:</span>
                    <span className="font-mono text-rose-600 dark:text-rose-400">
                      -{formatCurrency(totalDeductions)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Salary Highlight Banner */}
            <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-primary">
                  Net Disbursable Salary (Take-Home)
                </span>
                <p className="text-3xl font-extrabold font-mono text-primary mt-1">
                  {formatCurrency(payroll.netSalary)}
                </p>
              </div>

              {payroll.paidAt && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 className="size-4 shrink-0" />
                  <span>
                    Disbursed on {new Date(payroll.paidAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
