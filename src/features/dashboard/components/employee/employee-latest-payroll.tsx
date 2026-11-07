import { ArrowRight, Wallet } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { useEmployeeDashboard } from "@/features/dashboard/hooks/use-employee-dashboard";
import { formatDateShort } from "@/features/dashboard/utils/dashboard-time";
import { PayrollStatusBadge } from "@/features/payroll/components/payroll-status-badge";
import { formatCurrency, formatPayrollPeriod } from "@/features/payroll/utils/payroll-display";
import { cn } from "@/lib/utils";

type EmployeeLatestPayrollProps = {
  dashboard: ReturnType<typeof useEmployeeDashboard>;
};

export function EmployeeLatestPayroll({ dashboard }: EmployeeLatestPayrollProps) {
  const { latestPayrollQuery, latestPayroll } = dashboard;
  const isLoading = latestPayrollQuery.isLoading;
  const isError = latestPayrollQuery.isError;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Latest payroll</CardTitle>
          <CardDescription>Most recently finalized or disbursed salary period.</CardDescription>
        </div>
        <Link
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
          href="/employee/payroll"
        >
          Payroll records
          <ArrowRight aria-hidden="true" className="size-3.5 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : isError ? (
          <p className="rounded-lg bg-destructive-soft p-4 text-xs text-destructive">
            Failed to load your payroll information.
          </p>
        ) : !latestPayroll ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            <Wallet aria-hidden="true" className="mx-auto size-6 text-muted-foreground/60 mb-2" />
            <p className="font-medium text-foreground">No finalized payslips available</p>
            <p className="mt-1">Disbursed salary statements will appear here after payroll finalization.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-4 border border-border">
              <div>
                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                  Pay Period
                </span>
                <p className="text-lg font-bold text-foreground">
                  {formatPayrollPeriod(latestPayroll.payrollMonth, latestPayroll.payrollYear)}
                </p>
              </div>
              <PayrollStatusBadge status={latestPayroll.status} />
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-md border border-border p-3">
                <span className="text-[10px] uppercase text-muted-foreground block">
                  Net Disbursed
                </span>
                <span className="text-base font-bold text-foreground font-mono">
                  {formatCurrency(latestPayroll.netSalary)}
                </span>
              </div>
              <div className="rounded-md border border-border p-3">
                <span className="text-[10px] uppercase text-muted-foreground block">
                  Attended Days
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {latestPayroll.attendedDays} days
                </span>
              </div>
              <div className="rounded-md border border-border p-3 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase text-muted-foreground block">
                  Payment Date
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  {latestPayroll.paidAt ? formatDateShort(latestPayroll.paidAt) : "Pending disbursement"}
                </span>
              </div>
            </div>

            <div className="pt-2 text-right">
              <Link
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs font-semibold")}
                href={`/employee/payroll/${latestPayroll.id}`}
              >
                View full payslip breakdown
                <ArrowRight aria-hidden="true" className="size-3.5 ml-1" />
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
