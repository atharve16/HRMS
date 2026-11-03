"use client";

import { ChevronLeft, ChevronRight, PartyPopper, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { ApplyLeaveDialog } from "@/features/leaves/components/apply-leave-dialog";
import { LeaveBalanceCards } from "@/features/leaves/components/leave-balance-cards";
import { LeaveCard } from "@/features/leaves/components/leave-card";
import {
  LeaveEmptyState,
  LeaveErrorState,
  LeaveSkeleton,
} from "@/features/leaves/components/leave-query-state";
import { LeaveTable } from "@/features/leaves/components/leave-table";
import {
  useMyLeaveBalances,
  useMyLeaves,
} from "@/features/leaves/hooks/use-leaves";
import type {
  EmployeeLeaveParams,
  LeaveStatus,
  LeaveType,
} from "@/features/leaves/types/leave-types";
import { LEAVE_TYPE_LABELS } from "@/features/leaves/utils/leave-display";
import { getLeaveErrorMessage } from "@/features/leaves/utils/leave-errors";

export function EmployeeLeaveScreen() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [status, setStatus] = useState<LeaveStatus | "">("");
  const [leaveType, setLeaveType] = useState<LeaveType | "">("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);
  const limit = 10;

  const balancesQuery = useMyLeaveBalances(selectedYear);

  const queryParams: EmployeeLeaveParams = {
    status: status || undefined,
    leaveType: leaveType || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page,
    limit,
  };

  const leavesQuery = useMyLeaves(queryParams);

  const handleResetFilters = () => {
    setStatus("");
    setLeaveType("");
    setFromDate("");
    setToDate("");
    setPage(0);
  };

  const balances = balancesQuery.data || [];
  const leavesPage = leavesQuery.data;

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="My Leaves"
          description="View your leave balances, submit leave applications, and track your request history."
          actions={
            <div className="flex items-center gap-3">
              <Select
                value={String(selectedYear)}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-32"
                aria-label="Filter leave balance by year"
              >
                {[currentYear - 1, currentYear, currentYear + 1].map((yr) => (
                  <option key={yr} value={yr}>
                    Year {yr}
                  </option>
                ))}
              </Select>
              <ApplyLeaveDialog balances={balances} />
            </div>
          }
        />

        {/* Leave Balances Section */}
        {balancesQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-28 w-full animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : balancesQuery.isError ? (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
            Unable to load leave balances:{" "}
            {getLeaveErrorMessage(balancesQuery.error)}
          </div>
        ) : (
          <LeaveBalanceCards balances={balances} year={selectedYear} />
        )}

        {/* Holiday Information Banner */}
        <div className="flex items-center justify-between rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2.5">
            <PartyPopper className="size-4 shrink-0 text-primary" />
            <span className="text-foreground">
              Official company holidays are automatically excluded from leave deductions.
            </span>
          </div>
          <Link
            href="/employee/holidays"
            className="font-semibold text-primary hover:underline shrink-0 ml-3"
          >
            View holidays →
          </Link>
        </div>

        {/* Filters Card */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="space-y-1">
                <Label htmlFor="statusFilter" className="text-xs">
                  Status
                </Label>
                <Select
                  id="statusFilter"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as LeaveStatus | "");
                    setPage(0);
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="typeFilter" className="text-xs">
                  Leave type
                </Label>
                <Select
                  id="typeFilter"
                  value={leaveType}
                  onChange={(e) => {
                    setLeaveType(e.target.value as LeaveType | "");
                    setPage(0);
                  }}
                >
                  <option value="">All Types</option>
                  <option value="CL">{LEAVE_TYPE_LABELS.CL}</option>
                  <option value="SL">{LEAVE_TYPE_LABELS.SL}</option>
                  <option value="EL">{LEAVE_TYPE_LABELS.EL}</option>
                  <option value="CO">{LEAVE_TYPE_LABELS.CO}</option>
                  <option value="LWP">{LEAVE_TYPE_LABELS.LWP}</option>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="fromDate" className="text-xs">
                  From date
                </Label>
                <Input
                  id="fromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(0);
                  }}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="toDate" className="text-xs">
                  To date
                </Label>
                <Input
                  id="toDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(0);
                  }}
                />
              </div>

              <div className="flex items-end">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleResetFilters}
                >
                  <RotateCcw className="mr-1.5 size-3.5" />
                  Reset
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaves Content */}
        {leavesQuery.isLoading ? (
          <LeaveSkeleton />
        ) : leavesQuery.isError ? (
          <LeaveErrorState
            message={getLeaveErrorMessage(leavesQuery.error)}
            retry={() => leavesQuery.refetch()}
          />
        ) : !leavesPage || leavesPage.content.length === 0 ? (
          <LeaveEmptyState
            title="No leave requests found"
            description="You have not submitted any leave applications matching the filters."
            action={<ApplyLeaveDialog balances={balances} />}
          />
        ) : (
          <div className="space-y-4">
            <div className="hidden md:block">
              <LeaveTable leaves={leavesPage.content} isAdmin={false} />
            </div>

            <div className="space-y-3 md:hidden">
              {leavesPage.content.map((leave) => (
                <LeaveCard key={leave.id} leave={leave} isAdmin={false} />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col items-center justify-between gap-4 rounded-xl border bg-card px-4 py-3 sm:flex-row">
              <p className="text-xs text-muted-foreground">
                Showing{" "}
                <span className="font-semibold text-foreground">
                  {leavesPage.content.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-foreground">
                  {leavesPage.totalElements}
                </span>{" "}
                requests (Page {leavesPage.page + 1} of{" "}
                {Math.max(leavesPage.totalPages, 1)})
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 0))}
                  disabled={leavesPage.first || page === 0}
                >
                  <ChevronLeft className="mr-1 size-3.5" />
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={leavesPage.last || page + 1 >= leavesPage.totalPages}
                >
                  Next
                  <ChevronRight className="ml-1 size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageContainer>
  );
}

