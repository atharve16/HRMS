"use client";

import {
  ArrowLeft,
  Banknote,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditDraftPayrollDialog } from "@/features/payroll/components/edit-draft-payroll-dialog";
import { PayrollLifecycleDialog } from "@/features/payroll/components/payroll-lifecycle-dialog";
import {
  PayrollErrorState,
  PayrollSkeleton,
} from "@/features/payroll/components/payroll-query-state";
import { PayrollStatusBadge } from "@/features/payroll/components/payroll-status-badge";
import { useAdminPayrollDetail } from "@/features/payroll/hooks/use-payroll";
import {
  ADJUSTMENT_TYPE_LABELS,
  canEditDraft,
  canFinalize,
  canPay,
  canReview,
  formatCurrency,
  formatPayrollPeriod,
} from "@/features/payroll/utils/payroll-display";
import { getPayrollErrorMessage } from "@/features/payroll/utils/payroll-errors";

export function AdminPayrollDetailScreen({
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
  } = useAdminPayrollDetail(payrollId);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Link
            className={buttonVariants({ variant: "ghost", size: "sm" })}
            href="/admin/payroll"
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Back to payroll directory
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
            href="/admin/payroll"
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Back to payroll directory
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
  const calc = payroll.calculationDetails;
  const payableDays = payroll.attendedDays + payroll.paidLeaveDays;

  return (
    <PageContainer>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            className={buttonVariants({ variant: "ghost", size: "sm" })}
            href="/admin/payroll"
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Back to payroll directory
          </Link>

          {/* Lifecycle Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {canEditDraft(payroll.status) && (
              <EditDraftPayrollDialog
                onSuccess={() => refetch()}
                payroll={payroll}
              />
            )}

            {canReview(payroll.status) && (
              <PayrollLifecycleDialog
                action="review"
                onSuccess={() => refetch()}
                payroll={payroll}
              />
            )}

            {canFinalize(payroll.status) && (
              <PayrollLifecycleDialog
                action="finalize"
                onSuccess={() => refetch()}
                payroll={payroll}
              />
            )}

            {canPay(payroll.status) && (
              <PayrollLifecycleDialog
                action="pay"
                onSuccess={() => refetch()}
                payroll={payroll}
              />
            )}
          </div>
        </div>

        <PageHeader
          actions={<PayrollStatusBadge status={payroll.status} />}
          description={`Payroll calculation details for ${payroll.employeeNameSnapshot || "Employee"} • ${periodLabel}`}
          title={`${payroll.employeeNameSnapshot || "Employee"} — ${periodLabel}`}
        />

        {/* Top Summary Banner */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border border-border bg-card">
            <CardContent className="p-4">
              <span className="text-xs text-muted-foreground">Fixed Monthly Salary</span>
              <p className="mt-1 text-xl font-bold font-mono text-foreground">
                {formatCurrency(payroll.monthlyFixedSalarySnapshot)}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardContent className="p-4">
              <span className="text-xs text-muted-foreground">Salary Deductions (Attendance)</span>
              <p className="mt-1 text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
                -{formatCurrency(payroll.salaryDeduction)}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardContent className="p-4">
              <span className="text-xs text-muted-foreground">Total Adjustments (Net)</span>
              <p className="mt-1 text-xl font-bold font-mono text-foreground">
                {payroll.totalEarnings >= payroll.totalDeductions ? "+" : ""}
                {formatCurrency(payroll.totalEarnings - payroll.totalDeductions)}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <span className="text-xs text-primary font-medium">Net Disbursable Salary</span>
              <p className="mt-1 text-2xl font-bold font-mono text-primary">
                {formatCurrency(payroll.netSalary)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Employee & Assignment Snapshot */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="size-4 text-primary" />
                Employee Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Employee Name</span>
                <span className="font-medium text-foreground">{payroll.employeeNameSnapshot || "—"}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Employee Code</span>
                <span className="font-mono font-medium text-foreground">{payroll.employeeCodeSnapshot}</span>
              </div>
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Department</span>
                <span className="text-foreground">{payroll.departmentSnapshot || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payroll Period</span>
                <span className="font-medium text-foreground">{periodLabel}</span>
              </div>
            </CardContent>
          </Card>

          {/* Attendance & Working Days Summary */}
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Calendar className="size-4 text-primary" />
                Attendance & Working Days
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted/40 p-2.5">
                  <span className="text-xs text-muted-foreground">Scheduled Work Days</span>
                  <p className="font-mono font-bold text-foreground">
                    {payroll.scheduledWorkingDays}
                  </p>
                </div>
                <div className="rounded-lg bg-emerald-50/60 dark:bg-emerald-950/20 p-2.5">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400">Attended Days</span>
                  <p className="font-mono font-bold text-emerald-800 dark:text-emerald-300">
                    {payroll.attendedDays}
                  </p>
                </div>
                <div className="rounded-lg bg-sky-50/60 dark:bg-sky-950/20 p-2.5">
                  <span className="text-xs text-sky-700 dark:text-sky-400">Paid Approved Leaves</span>
                  <p className="font-mono font-bold text-sky-800 dark:text-sky-300">
                    {payroll.paidLeaveDays}
                  </p>
                </div>
                <div className="rounded-lg bg-rose-50/60 dark:bg-rose-950/20 p-2.5">
                  <span className="text-xs text-rose-700 dark:text-rose-400">Unpaid Leaves</span>
                  <p className="font-mono font-bold text-rose-800 dark:text-rose-300">
                    {payroll.unpaidLeaveDays}
                  </p>
                </div>
                <div className="rounded-lg bg-amber-50/60 dark:bg-amber-950/20 p-2.5">
                  <span className="text-xs text-amber-700 dark:text-amber-400">Unexcused Absences</span>
                  <p className="font-mono font-bold text-amber-800 dark:text-amber-300">
                    {payroll.unexcusedAbsenceDays}
                  </p>
                </div>
                <div className="rounded-lg bg-rose-50/60 dark:bg-rose-950/20 p-2.5">
                  <span className="text-xs text-rose-700 dark:text-rose-400">Total Unpaid Days</span>
                  <p className="font-mono font-bold text-rose-800 dark:text-rose-300">
                    {payroll.totalUnpaidDays}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-border/60">
                <span className="font-medium text-foreground">Total Payable Days:</span>
                <span className="font-mono font-bold text-primary text-base">
                  {payableDays} / {payroll.scheduledWorkingDays}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Adjustments: Earnings and Deductions */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Earnings */}
          <Card className="border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Banknote className="size-4" />
                Additional Earnings
              </CardTitle>
              <span className="font-mono font-semibold text-sm text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(payroll.totalEarnings)}
              </span>
            </CardHeader>
            <CardContent>
              {payroll.earnings.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-2">
                  No additional earnings for this period.
                </p>
              ) : (
                <div className="space-y-2">
                  {payroll.earnings.map((e, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm rounded-lg border border-border/60 bg-muted/20 p-2.5"
                    >
                      <div>
                        <p className="font-medium text-foreground">{e.description}</p>
                        <span className="text-xs text-muted-foreground">
                          {ADJUSTMENT_TYPE_LABELS[e.type] ?? e.type}
                        </span>
                      </div>
                      <span className="font-mono font-medium text-emerald-600 dark:text-emerald-400">
                        +{formatCurrency(e.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Deductions */}
          <Card className="border border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <CreditCard className="size-4" />
                Other Deductions
              </CardTitle>
              <span className="font-mono font-semibold text-sm text-rose-600 dark:text-rose-400">
                -{formatCurrency(payroll.totalDeductions)}
              </span>
            </CardHeader>
            <CardContent>
              {payroll.deductions.length === 0 ? (
                <p className="text-xs text-muted-foreground italic py-2">
                  No other deductions for this period.
                </p>
              ) : (
                <div className="space-y-2">
                  {payroll.deductions.map((d, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm rounded-lg border border-border/60 bg-muted/20 p-2.5"
                    >
                      <div>
                        <p className="font-medium text-foreground">{d.description}</p>
                        <span className="text-xs text-muted-foreground">
                          {ADJUSTMENT_TYPE_LABELS[d.type] ?? d.type}
                        </span>
                      </div>
                      <span className="font-mono font-medium text-rose-600 dark:text-rose-400">
                        -{formatCurrency(d.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Calculation Formula Details */}
        {calc && (
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="size-4 text-primary" />
                Calculation Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-muted/30 p-3 rounded-lg font-mono">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Daily Salary Rate</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(payroll.dailySalaryRate)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Total Unpaid Days</span>
                  <span className="font-semibold text-foreground">
                    {payroll.totalUnpaidDays}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Attendance Loss</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-400">
                    -{formatCurrency(payroll.salaryDeduction)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Formula</span>
                  <span className="font-semibold text-foreground truncate block">
                    {calc.formula || "net = base - ded + adj"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Lifecycle & Audit History */}
        <Card className="border border-border bg-card">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              Lifecycle & Audit Trail
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 text-xs">
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <span className="text-muted-foreground block">Created At</span>
                <span className="font-mono text-foreground block mt-1">
                  {payroll.createdAt ? new Date(payroll.createdAt).toLocaleString() : "—"}
                </span>
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <span className="text-muted-foreground block">Reviewed By</span>
                <span className="font-medium text-foreground block mt-1">
                  {payroll.reviewedBy || "—"}
                </span>
                {payroll.reviewedAt && (
                  <span className="font-mono text-[11px] text-muted-foreground block">
                    {new Date(payroll.reviewedAt).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <span className="text-muted-foreground block">Finalized By</span>
                <span className="font-medium text-foreground block mt-1">
                  {payroll.finalizedBy || "—"}
                </span>
                {payroll.finalizedAt && (
                  <span className="font-mono text-[11px] text-muted-foreground block">
                    {new Date(payroll.finalizedAt).toLocaleString()}
                  </span>
                )}
              </div>

              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <span className="text-muted-foreground block">Paid By</span>
                <span className="font-medium text-foreground block mt-1">
                  {payroll.paidBy || "—"}
                </span>
                {payroll.paidAt && (
                  <span className="font-mono text-[11px] text-muted-foreground block">
                    {new Date(payroll.paidAt).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
