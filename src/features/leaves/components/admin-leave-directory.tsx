"use client";

import {
  ChevronLeft,
  ChevronRight,
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
import { LeaveCard } from "@/features/leaves/components/leave-card";
import {
  LeaveEmptyState,
  LeaveErrorState,
  LeaveSkeleton,
} from "@/features/leaves/components/leave-query-state";
import { LeaveTable } from "@/features/leaves/components/leave-table";
import { useAdminLeaves } from "@/features/leaves/hooks/use-leaves";
import type {
  LeaveSearchParams,
  LeaveStatus,
  LeaveType,
} from "@/features/leaves/types/leave-types";
import { LEAVE_TYPE_LABELS } from "@/features/leaves/utils/leave-display";
import { getLeaveErrorMessage } from "@/features/leaves/utils/leave-errors";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function AdminLeaveDirectory() {
  const [employeeCodeInput, setEmployeeCodeInput] = useState("");
  const debouncedEmployeeCode = useDebouncedValue(employeeCodeInput, 400);

  const [status, setStatus] = useState<LeaveStatus | "">("");
  const [leaveType, setLeaveType] = useState<LeaveType | "">("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(0);
  const limit = 20;

  const searchParams: LeaveSearchParams = {
    employeeCode: debouncedEmployeeCode.trim() || undefined,
    status: status || undefined,
    leaveType: leaveType || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    sortBy,
    sortDirection,
    page,
    limit,
  };

  const leavesQuery = useAdminLeaves(searchParams);

  const handleResetFilters = () => {
    setEmployeeCodeInput("");
    setStatus("");
    setLeaveType("");
    setFromDate("");
    setToDate("");
    setSortBy("createdAt");
    setSortDirection("desc");
    setPage(0);
  };

  const leavesPage = leavesQuery.data;

  return (
    <PageContainer>
      <div className="space-y-6">
        <PageHeader
          title="Leave Requests"
          description="Manage and review employee leave applications across the organization."
        />

        {/* Quick Status Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              { label: "All Requests", value: "" },
              { label: "Pending", value: "PENDING" },
              { label: "Approved", value: "APPROVED" },
              { label: "Rejected", value: "REJECTED" },
              { label: "Cancelled", value: "CANCELLED" },
            ] as const
          ).map((tab) => {
            const isSelected = status === tab.value;
            return (
              <button
                key={tab.value}
                type="button"
                onClick={() => {
                  setStatus(tab.value as LeaveStatus | "");
                  setPage(0);
                }}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Filters Card */}
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6">
              <div className="space-y-1">
                <Label htmlFor="adminEmployeeCode" className="text-xs">
                  Employee code
                </Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="adminEmployeeCode"
                    placeholder="e.g. EMP-001"
                    className="pl-8 text-xs"
                    value={employeeCodeInput}
                    onChange={(e) => {
                      setEmployeeCodeInput(e.target.value);
                      setPage(0);
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="adminTypeFilter" className="text-xs">
                  Leave type
                </Label>
                <Select
                  id="adminTypeFilter"
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
                <Label htmlFor="adminFromDate" className="text-xs">
                  From date
                </Label>
                <Input
                  id="adminFromDate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(0);
                  }}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="adminToDate" className="text-xs">
                  To date
                </Label>
                <Input
                  id="adminToDate"
                  type="date"
                  value={toDate}
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(0);
                  }}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="adminSortBy" className="text-xs">
                  Sort by
                </Label>
                <Select
                  id="adminSortBy"
                  value={`${sortBy}-${sortDirection}`}
                  onChange={(e) => {
                    const [fld, dir] = e.target.value.split("-") as [
                      string,
                      "asc" | "desc",
                    ];
                    setSortBy(fld);
                    setSortDirection(dir);
                    setPage(0);
                  }}
                >
                  <option value="createdAt-desc">Newest first</option>
                  <option value="createdAt-asc">Oldest first</option>
                  <option value="startDate-asc">Start date (Earliest)</option>
                  <option value="startDate-desc">Start date (Latest)</option>
                </Select>
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

        {/* Directory Content */}
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
            description="No applications match the specified search or filter criteria."
          />
        ) : (
          <div className="space-y-4">
            <div className="hidden md:block">
              <LeaveTable leaves={leavesPage.content} isAdmin={true} />
            </div>

            <div className="space-y-3 md:hidden">
              {leavesPage.content.map((leave) => (
                <LeaveCard key={leave.id} leave={leave} isAdmin={true} />
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

