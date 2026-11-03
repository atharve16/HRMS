"use client";

import { RotateCcw, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { AttendanceCard } from "@/features/attendance/components/attendance-card";
import {
  AttendanceEmptyState,
  AttendanceErrorState,
  AttendanceSkeleton,
} from "@/features/attendance/components/attendance-query-state";
import { AttendanceSummaryCards } from "@/features/attendance/components/attendance-summary-cards";
import { AttendanceTable } from "@/features/attendance/components/attendance-table";
import {
  useAdminAttendance,
  useAdminAttendanceSummary,
} from "@/features/attendance/hooks/use-attendance";
import type {
  AdminAttendanceParams,
  AttendanceStatus,
} from "@/features/attendance/types/attendance-types";
import { getAttendanceErrorMessage } from "@/features/attendance/utils/attendance-errors";
import { useDepartments } from "@/features/departments/hooks/use-departments";
import { useOfficeLocationOptions } from "@/features/office-locations/hooks/use-office-location-references";
import { useShiftOptions } from "@/features/shifts/hooks/use-shift-references";

export function AdminAttendanceDirectory() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [employeeCode, setEmployeeCode] = useState(
    searchParams.get("employeeCode") || "",
  );
  const [departmentId, setDepartmentId] = useState(
    searchParams.get("departmentId") || "",
  );
  const [officeLocationId, setOfficeLocationId] = useState(
    searchParams.get("officeLocationId") || "",
  );
  const [shiftId, setShiftId] = useState(searchParams.get("shiftId") || "");
  const [status, setStatus] = useState<AttendanceStatus | "">(
    (searchParams.get("status") as AttendanceStatus) || "",
  );
  const [fromDate, setFromDate] = useState(searchParams.get("fromDate") || "");
  const [toDate, setToDate] = useState(searchParams.get("toDate") || "");
  const [page, setPage] = useState(
    Number(searchParams.get("page") || "0"),
  );

  const departmentsQuery = useDepartments({
    page: 0,
    limit: 100,
    status: "ACTIVE",
  });
  const officesQuery = useOfficeLocationOptions();
  const shiftsQuery = useShiftOptions();

  const queryParams: AdminAttendanceParams = useMemo(
    () => ({
      employeeCode: employeeCode || undefined,
      departmentId: departmentId || undefined,
      officeLocationId: officeLocationId || undefined,
      shiftId: shiftId || undefined,
      status: status || undefined,
      fromDate: fromDate || undefined,
      toDate: toDate || undefined,
      page,
      limit: 20,
      sortBy: "workDate",
      sortDirection: "desc",
    }),
    [
      employeeCode,
      departmentId,
      officeLocationId,
      shiftId,
      status,
      fromDate,
      toDate,
      page,
    ],
  );

  const summaryQuery = useAdminAttendanceSummary({
    employeeCode: employeeCode || undefined,
    departmentId: departmentId || undefined,
    officeLocationId: officeLocationId || undefined,
    shiftId: shiftId || undefined,
    status: status || undefined,
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
  });

  const listQuery = useAdminAttendance(queryParams);

  function handleFilterReset() {
    setEmployeeCode("");
    setDepartmentId("");
    setOfficeLocationId("");
    setShiftId("");
    setStatus("");
    setFromDate("");
    setToDate("");
    setPage(0);
    router.replace("/admin/attendance");
  }

  const hasActiveFilters = Boolean(
    employeeCode ||
      departmentId ||
      officeLocationId ||
      shiftId ||
      status ||
      fromDate ||
      toDate,
  );

  return (
    <PageContainer>
      <PageHeader
        description="Monitor organization-wide punches, geofence validations, daily work hours, and manage punch corrections."
        eyebrow="Workforce management"
        title="Attendance management"
      />

      <div className="space-y-6">
        {/* Metric Summary Cards */}
        {summaryQuery.data && (
          <AttendanceSummaryCards summary={summaryQuery.data} />
        )}

        {/* Filter Bar */}
        <Card className="border-border">
          <CardContent className="p-4 sm:p-5">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label className="text-xs font-semibold" htmlFor="empCodeSearch">
                  Search employee code
                </Label>
                <div className="relative mt-1.5">
                  <Search
                    aria-hidden="true"
                    className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                  />
                  <Input
                    className="pl-9"
                    id="empCodeSearch"
                    onChange={(e) => {
                      setEmployeeCode(e.target.value);
                      setPage(0);
                    }}
                    placeholder="e.g. EMP-001"
                    value={employeeCode}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-semibold" htmlFor="statusFilter">
                  Attendance status
                </Label>
                <Select
                  className="mt-1.5"
                  id="statusFilter"
                  onChange={(e) => {
                    setStatus(e.target.value as AttendanceStatus);
                    setPage(0);
                  }}
                  value={status}
                >
                  <option value="">All statuses</option>
                  <option value="PRESENT">Present</option>
                  <option value="PARTIAL">Partial</option>
                  <option value="INCOMPLETE">Incomplete / Open</option>
                  <option value="ABSENT">Absent</option>
                  <option value="HOLIDAY">Holiday</option>
                  <option value="ON_LEAVE">On Leave</option>
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold" htmlFor="deptFilter">
                  Department
                </Label>
                <Select
                  className="mt-1.5"
                  id="deptFilter"
                  onChange={(e) => {
                    setDepartmentId(e.target.value);
                    setPage(0);
                  }}
                  value={departmentId}
                >
                  <option value="">All departments</option>
                  {departmentsQuery.data?.content.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold" htmlFor="officeFilter">
                  Office location
                </Label>
                <Select
                  className="mt-1.5"
                  id="officeFilter"
                  onChange={(e) => {
                    setOfficeLocationId(e.target.value);
                    setPage(0);
                  }}
                  value={officeLocationId}
                >
                  <option value="">All locations</option>
                  {officesQuery.data?.content.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.locationCode})
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-4 sm:items-end border-t pt-4">
              <div>
                <Label className="text-xs font-semibold" htmlFor="shiftFilter">
                  Work shift
                </Label>
                <Select
                  className="mt-1.5"
                  id="shiftFilter"
                  onChange={(e) => {
                    setShiftId(e.target.value);
                    setPage(0);
                  }}
                  value={shiftId}
                >
                  <option value="">All shifts</option>
                  {shiftsQuery.data?.content.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.shiftCode})
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <Label className="text-xs font-semibold" htmlFor="admin-from-date">
                  From date
                </Label>
                <Input
                  className="mt-1.5"
                  id="admin-from-date"
                  onChange={(e) => {
                    setFromDate(e.target.value);
                    setPage(0);
                  }}
                  type="date"
                  value={fromDate}
                />
              </div>

              <div>
                <Label className="text-xs font-semibold" htmlFor="admin-to-date">
                  To date
                </Label>
                <Input
                  className="mt-1.5"
                  id="admin-to-date"
                  onChange={(e) => {
                    setToDate(e.target.value);
                    setPage(0);
                  }}
                  type="date"
                  value={toDate}
                />
              </div>

              <div>
                {hasActiveFilters && (
                  <Button
                    onClick={handleFilterReset}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    <RotateCcw aria-hidden="true" className="size-3.5 mr-1" />
                    Reset filters
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Directory Listing */}
        {listQuery.isLoading ? (
          <AttendanceSkeleton />
        ) : listQuery.isError ? (
          <AttendanceErrorState
            message={getAttendanceErrorMessage(listQuery.error)}
            retry={() => listQuery.refetch()}
          />
        ) : listQuery.data ? (
          listQuery.data.content.length === 0 ? (
            <AttendanceEmptyState
              action={
                hasActiveFilters ? (
                  <Button onClick={handleFilterReset} variant="outline">
                    Clear all filters
                  </Button>
                ) : undefined
              }
              description={
                hasActiveFilters
                  ? "Try clearing some filter criteria to expand results."
                  : "No attendance punches have been recorded in the system yet."
              }
              title={hasActiveFilters ? "No matching records" : "No attendance data"}
            />
          ) : (
            <div className="space-y-4">
              {/* Desktop View */}
              <div className="hidden md:block">
                <AttendanceTable isAdmin={true} records={listQuery.data.content} />
              </div>

              {/* Mobile View */}
              <div className="grid gap-3 md:hidden">
                {listQuery.data.content.map((rec) => (
                  <AttendanceCard isAdmin={true} key={rec.id} record={rec} />
                ))}
              </div>

              {/* Pagination */}
              {listQuery.data.totalPages > 1 && (
                <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                  <span>
                    Page {listQuery.data.page + 1} of {listQuery.data.totalPages} (
                    {listQuery.data.totalElements} records)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      disabled={listQuery.data.first}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      size="sm"
                      variant="outline"
                    >
                      Previous
                    </Button>
                    <Button
                      disabled={listQuery.data.last}
                      onClick={() => setPage((p) => p + 1)}
                      size="sm"
                      variant="outline"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        ) : null}
      </div>
    </PageContainer>
  );
}

