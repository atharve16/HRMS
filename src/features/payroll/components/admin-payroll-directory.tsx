"use client";

import {
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileCheck2,
  RotateCcw,
  Search,
} from "lucide-react";
import { useState } from "react";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { GeneratePayrollDialog } from "@/features/payroll/components/generate-payroll-dialog";
import { PayrollCard } from "@/features/payroll/components/payroll-card";
import {
  PayrollEmptyState,
  PayrollErrorState,
  PayrollSkeleton,
} from "@/features/payroll/components/payroll-query-state";
import { PayrollTable } from "@/features/payroll/components/payroll-table";
import { useAdminPayrolls } from "@/features/payroll/hooks/use-payroll";
import type {
  AdminPayrollParams,
  PayrollStatus,
} from "@/features/payroll/types/payroll-types";
import {
  formatCurrency,
  MONTH_OPTIONS,
} from "@/features/payroll/utils/payroll-display";
import { getPayrollErrorMessage } from "@/features/payroll/utils/payroll-errors";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function AdminPayrollDirectory() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedMonth, setSelectedMonth] = useState<number | "">(currentMonth);
  const [selectedYear, setSelectedYear] = useState<number | "">(currentYear);
  const [selectedStatus, setSelectedStatus] = useState<PayrollStatus | "">("");
  const [employeeCodeInput, setEmployeeCodeInput] = useState("");
  const debouncedEmployeeCode = useDebouncedValue(employeeCodeInput, 400);

  const [page, setPage] = useState(0);
  const limit = 20;

  const queryParams: AdminPayrollParams = {
    month: selectedMonth === "" ? undefined : Number(selectedMonth),
    year: selectedYear === "" ? undefined : Number(selectedYear),
    status: selectedStatus || undefined,
    employeeCode: debouncedEmployeeCode.trim() || undefined,
    page,
    limit,
    sortDirection: "desc",
  };

  const payrollQuery = useAdminPayrolls(queryParams);

  const handleResetFilters = () => {
    setSelectedMonth(currentMonth);
    setSelectedYear(currentYear);
    setSelectedStatus("");
    setEmployeeCodeInput("");
    setPage(0);
  };

  const pageData = payrollQuery.data;
  const items = pageData?.items ?? [];

  // Metrics calculation
  const totalCount = pageData?.totalItems ?? items.length;
  const draftCount = items.filter((p) => p.status === "DRAFT").length;
  const reviewedCount = items.filter((p) => p.status === "REVIEWED").length;
  const finalizedOrPaidCount = items.filter(
    (p) => p.status === "FINALIZED" || p.status === "PAID",
  ).length;
  const totalNetSum = items.reduce((acc, p) => acc + p.netSalary, 0);

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          actions={
            <GeneratePayrollDialog
              defaultMonth={selectedMonth === "" ? currentMonth : Number(selectedMonth)}
              defaultYear={selectedYear === "" ? currentYear : Number(selectedYear)}
              onSuccess={() => payrollQuery.refetch()}
            />
          }
          description="Generate monthly payrolls, review attendance loss, adjust allowances and deductions, and disburse employee salaries."
          title="Payroll Management"
        />

        {/* Top Summary Metrics */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          <Card className="border border-border bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Banknote className="size-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Page Net Payable</p>
                <p className="text-lg font-bold font-mono text-foreground">
                  {formatCurrency(totalNetSum)}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Clock className="size-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Draft Records</p>
                <p className="text-lg font-bold text-foreground">{draftCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400">
                <FileCheck2 className="size-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Reviewed</p>
                <p className="text-lg font-bold text-foreground">{reviewedCount}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border bg-card">
            <CardContent className="p-4 flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-5" />
              </span>
              <div>
                <p className="text-xs text-muted-foreground font-medium">Finalized / Paid</p>
                <p className="text-lg font-bold text-foreground">
                  {finalizedOrPaidCount}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters Section */}
        <Card className="border border-border bg-card">
          <CardContent className="p-4 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              <div className="space-y-1">
                <Label htmlFor="filter-month">Month</Label>
                <Select
                  id="filter-month"
                  onChange={(e) => {
                    setSelectedMonth(e.target.value ? Number(e.target.value) : "");
                    setPage(0);
                  }}
                  value={selectedMonth}
                >
                  <option value="">All Months</option>
                  {MONTH_OPTIONS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="filter-year">Year</Label>
                <Input
                  id="filter-year"
                  max={2100}
                  min={2000}
                  onChange={(e) => {
                    setSelectedYear(e.target.value ? Number(e.target.value) : "");
                    setPage(0);
                  }}
                  placeholder="e.g. 2026"
                  type="number"
                  value={selectedYear}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="filter-status">Status</Label>
                <Select
                  id="filter-status"
                  onChange={(e) => {
                    setSelectedStatus(e.target.value as PayrollStatus | "");
                    setPage(0);
                  }}
                  value={selectedStatus}
                >
                  <option value="">All Statuses</option>
                  <option value="DRAFT">Draft</option>
                  <option value="REVIEWED">Reviewed</option>
                  <option value="FINALIZED">Finalized</option>
                  <option value="PAID">Paid</option>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="filter-code">Employee Code</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    id="filter-code"
                    onChange={(e) => {
                      setEmployeeCodeInput(e.target.value);
                      setPage(0);
                    }}
                    placeholder="Search by code..."
                    value={employeeCodeInput}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                className="text-xs"
                onClick={handleResetFilters}
                size="sm"
                type="button"
                variant="ghost"
              >
                <RotateCcw className="mr-1.5 size-3.5" />
                Reset Filters
              </Button>
            </div>
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
            action={
              <GeneratePayrollDialog
                defaultMonth={selectedMonth === "" ? currentMonth : Number(selectedMonth)}
                defaultYear={selectedYear === "" ? currentYear : Number(selectedYear)}
                onSuccess={() => payrollQuery.refetch()}
              />
            }
            description="No payroll records match the selected month, year, or filters. You can generate payroll for this period."
            title="No payroll records found"
          />
        ) : (
          <div className="space-y-4">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <PayrollTable payrolls={items} />
            </div>

            {/* Mobile Cards */}
            <div className="space-y-3 md:hidden">
              {items.map((payroll) => (
                <PayrollCard key={payroll.id} payroll={payroll} />
              ))}
            </div>

            {/* Pagination Controls */}
            {pageData && pageData.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing <span className="font-medium text-foreground">{items.length}</span> of{" "}
                  <span className="font-medium text-foreground">{totalCount}</span> records
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
