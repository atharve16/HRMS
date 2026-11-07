import { ArrowRight, Wallet } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { useAdminDashboard } from "@/features/dashboard/hooks/use-admin-dashboard";
import { PayrollStatusBadge } from "@/features/payroll/components/payroll-status-badge";
import { formatCurrency, formatPayrollPeriod } from "@/features/payroll/utils/payroll-display";
import { cn } from "@/lib/utils";

type AdminPayrollOverviewProps = {
  dashboard: ReturnType<typeof useAdminDashboard>;
};

export function AdminPayrollOverview({ dashboard }: AdminPayrollOverviewProps) {
  const {
    payrollDraftQuery,
    payrollReviewedQuery,
    payrollFinalizedQuery,
    payrollPaidQuery,
    recentPayrollQuery,
  } = dashboard;

  const isCountsLoading =
    payrollDraftQuery.isLoading ||
    payrollReviewedQuery.isLoading ||
    payrollFinalizedQuery.isLoading ||
    payrollPaidQuery.isLoading;

  const isRecentLoading = recentPayrollQuery.isLoading;

  const draftCount = payrollDraftQuery.data?.totalItems ?? 0;
  const reviewedCount = payrollReviewedQuery.data?.totalItems ?? 0;
  const finalizedCount = payrollFinalizedQuery.data?.totalItems ?? 0;
  const paidCount = payrollPaidQuery.data?.totalItems ?? 0;

  const recentPayrolls = recentPayrollQuery.data?.items ?? [];

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Payroll lifecycle overview</CardTitle>
          <CardDescription>
            Lifecycle transition counts and latest generated employee records.
          </CardDescription>
        </div>
        <Link
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
          href="/admin/payroll"
        >
          Manage payroll
          <ArrowRight aria-hidden="true" className="size-3.5 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        {/* Status Lifecycle Counters */}
        {isCountsLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3">
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                Draft
              </span>
              <p className="text-2xl font-bold text-foreground mt-1">{draftCount}</p>
              <span className="text-[11px] text-muted-foreground">Pending initial review</span>
            </div>
            <div className="rounded-lg bg-sky-500/10 border border-sky-500/20 p-3">
              <span className="text-xs font-semibold text-sky-700 dark:text-sky-400">
                Reviewed
              </span>
              <p className="text-2xl font-bold text-foreground mt-1">{reviewedCount}</p>
              <span className="text-[11px] text-muted-foreground">Ready for finalization</span>
            </div>
            <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3">
              <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400">
                Finalized
              </span>
              <p className="text-2xl font-bold text-foreground mt-1">{finalizedCount}</p>
              <span className="text-[11px] text-muted-foreground">Locked for payment</span>
            </div>
            <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Paid
              </span>
              <p className="text-2xl font-bold text-foreground mt-1">{paidCount}</p>
              <span className="text-[11px] text-muted-foreground">Disbursed to employees</span>
            </div>
          </div>
        )}

        {/* Recent Payroll Entries Table */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Recent payroll records
          </p>
          {isRecentLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : recentPayrolls.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              <Wallet aria-hidden="true" className="mx-auto size-6 text-muted-foreground/60 mb-2" />
              <p className="font-medium text-foreground">No payroll records generated yet</p>
              <p className="mt-1">Generate a monthly payroll run from the payroll management screen.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-lg border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Net Salary</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentPayrolls.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <span className="block font-medium text-foreground text-xs">
                          {record.employeeNameSnapshot || "Employee"}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {record.employeeCodeSnapshot}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatPayrollPeriod(record.payrollMonth, record.payrollYear)}
                      </TableCell>
                      <TableCell className="text-right text-xs font-medium font-mono">
                        {formatCurrency(record.netSalary)}
                      </TableCell>
                      <TableCell className="text-right">
                        <PayrollStatusBadge status={record.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

