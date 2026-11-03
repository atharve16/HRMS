"use client";

import {
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PayrollEmptyState,
  PayrollErrorState,
  PayrollSkeleton,
} from "@/features/payroll/components/payroll-query-state";
import { PayrollStatusBadge } from "@/features/payroll/components/payroll-status-badge";
import { useEmployeePayrolls } from "@/features/payroll/hooks/use-payroll";
import type { EmployeePayrollParams } from "@/features/payroll/types/payroll-types";
import {
  formatCurrency,
  formatPayrollPeriod,
} from "@/features/payroll/utils/payroll-display";
import { getPayrollErrorMessage } from "@/features/payroll/utils/payroll-errors";

export function EmployeePayrollScreen() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number | "">(currentYear);
  const [page, setPage] = useState(0);
  const limit = 12;

  const queryParams: EmployeePayrollParams = {
    year: selectedYear === "" ? undefined : Number(selectedYear),
    page,
    limit,
  };

  const payrollQuery = useEmployeePayrolls(queryParams);
  const pageData = payrollQuery.data;
  const items = pageData?.items ?? [];

  const handleResetFilters = () => {
    setSelectedYear(currentYear);
    setPage(0);
  };

  // Metrics
  const totalPayslips = pageData?.totalItems ?? items.length;
  const paidItems = items.filter((p) => p.status === "PAID");
  const totalPaidSum = paidItems.reduce((acc, p) => acc + p.netSalary, 0);

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          description="View your monthly finalized payslips, salary breakdowns, deductions, and payment status."
          title="My Payslips"
        />

        {/* Summary Metrics */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
          <Card className="border border-border bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <FileText className="size-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Available Payslips</p>
                <p className="text-lg font-bold text-foreground">{totalPayslips}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Paid Payslips</p>
                <p className="text-lg font-bold text-foreground">{paidItems.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Banknote className="size-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Total Paid YTD</p>
                <p className="text-lg font-bold font-mono text-foreground">
                  {formatCurrency(totalPaidSum)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter Bar */}
        <Card className="border border-border bg-card">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Label className="shrink-0 text-sm" htmlFor="employee-payroll-year">
                Filter by Year:
              </Label>
              <Input
                className="w-32"
                id="employee-payroll-year"
                max={2100}
                min={2000}
                onChange={(e) => {
                  setSelectedYear(e.target.value ? Number(e.target.value) : "");
                  setPage(0);
                }}
                type="number"
                value={selectedYear}
              />
            </div>

            <Button
              className="text-xs w-full sm:w-auto"
              onClick={handleResetFilters}
              size="sm"
              type="button"
              variant="ghost"
            >
              <RotateCcw className="mr-1.5 size-3.5" />
              Reset Year
            </Button>
          </CardContent>
        </Card>

        {/* Content Section */}
        {payrollQuery.isLoading ? (
          <PayrollSkeleton />
        ) : payrollQuery.isError ? (
          <PayrollErrorState
            message={getPayrollErrorMessage(payrollQuery.error)}
            retry={() => payrollQuery.refetch()}
          />
        ) : items.length === 0 ? (
          <PayrollEmptyState
            description="Your payslips will be visible here once they have been finalized by human resources."
            title="No payslips available"
          />
        ) : (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden sm:block rounded-xl border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-center">Days (Pay / Sched)</TableHead>
                    <TableHead className="text-right">Fixed Base</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Net Take-Home</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Payslip</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((payroll) => {
                    const payableDays = payroll.attendedDays + payroll.paidLeaveDays;
                    return (
                      <TableRow key={payroll.id}>
                        <TableCell className="font-medium text-foreground">
                          {formatPayrollPeriod(payroll.payrollMonth, payroll.payrollYear)}
                        </TableCell>
                        <TableCell className="text-center font-mono text-sm">
                          {payableDays} / {payroll.scheduledWorkingDays}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm">
                          {formatCurrency(payroll.monthlyFixedSalary)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-sm text-rose-600 dark:text-rose-400">
                          -{formatCurrency(payroll.salaryDeduction)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-bold text-foreground">
                          {formatCurrency(payroll.netSalary)}
                        </TableCell>
                        <TableCell className="text-center">
                          <PayrollStatusBadge status={payroll.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            aria-label={`View payslip for ${formatPayrollPeriod(payroll.payrollMonth, payroll.payrollYear)}`}
                            className={buttonVariants({ size: "sm", variant: "outline" })}
                            href={`/employee/payroll/${payroll.id}`}
                          >
                            <Eye className="mr-1.5 size-3.5" />
                            View Payslip
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 sm:hidden">
              {items.map((payroll) => {
                const payableDays = payroll.attendedDays + payroll.paidLeaveDays;
                return (
                  <Card key={payroll.id} className="border border-border bg-card">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground">
                          {formatPayrollPeriod(payroll.payrollMonth, payroll.payrollYear)}
                        </p>
                        <PayrollStatusBadge status={payroll.status} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs border-y border-border/60 py-2">
                        <div>
                          <span className="text-muted-foreground">Payable Days:</span>
                          <p className="font-mono font-medium text-foreground">
                            {payableDays} / {payroll.scheduledWorkingDays}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Fixed Salary:</span>
                          <p className="font-mono font-medium text-foreground">
                            {formatCurrency(payroll.monthlyFixedSalary)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Deductions:</span>
                          <p className="font-mono font-medium text-rose-600 dark:text-rose-400">
                            -{formatCurrency(payroll.salaryDeduction)}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Net Pay:</span>
                          <p className="font-mono font-bold text-foreground">
                            {formatCurrency(payroll.netSalary)}
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-end pt-1">
                        <Link
                          className={buttonVariants({ size: "sm", variant: "outline" })}
                          href={`/employee/payroll/${payroll.id}`}
                        >
                          <Eye className="mr-1.5 size-3.5" />
                          View Payslip
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {pageData && pageData.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{items.length}</span> of{" "}
                  <span className="font-medium text-foreground">{totalPayslips}</span> payslips
                  (Page {page + 1} of {pageData.totalPages})
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    disabled={!pageData.hasPrevious}
                    onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <ChevronLeft className="mr-1 size-4" /> Previous
                  </Button>
                  <Button
                    disabled={!pageData.hasNext}
                    onClick={() => setPage((prev) => prev + 1)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Next <ChevronRight className="ml-1 size-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
