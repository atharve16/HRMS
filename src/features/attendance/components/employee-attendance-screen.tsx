"use client";

import {
  CalendarDays,
  Coffee,
  MapPin,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AttendanceCard } from "@/features/attendance/components/attendance-card";
import {
  AttendanceEmptyState,
  AttendanceErrorState,
  AttendanceSkeleton,
} from "@/features/attendance/components/attendance-query-state";
import { AttendanceSessionsCard } from "@/features/attendance/components/attendance-sessions-card";
import { AttendanceStatusBadge } from "@/features/attendance/components/attendance-status-badge";
import { AttendanceTable } from "@/features/attendance/components/attendance-table";
import { EmployeeCheckInWidget } from "@/features/attendance/components/employee-check-in-widget";
import {
  useMyAttendanceHistory,
  useMyAttendanceStatus,
  useMyTodayAttendance,
} from "@/features/attendance/hooks/use-attendance";
import {
  formatAttendanceDate,
  formatDurationMinutes,
} from "@/features/attendance/utils/attendance-display";
import { getAttendanceErrorMessage } from "@/features/attendance/utils/attendance-errors";

export function EmployeeAttendanceScreen() {
  const todayStr = new Date().toISOString().slice(0, 10);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);

  const statusQuery = useMyAttendanceStatus();
  const todayQuery = useMyTodayAttendance(todayStr);
  const historyQuery = useMyAttendanceHistory({
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page,
    limit: 10,
    sortBy: "workDate",
    sortDirection: "desc",
  });

  const todayRecord = todayQuery.data;
  const status = statusQuery.data;

  function handleFilterReset() {
    setFromDate("");
    setToDate("");
    setPage(0);
  }

  function handlePunchSuccess() {
    statusQuery.refetch();
    todayQuery.refetch();
    historyQuery.refetch();
  }

  return (
    <PageContainer>
      <PageHeader
        description="Punch in and out for scheduled shifts and review your attendance history."
        eyebrow="Time & Attendance"
        title="My attendance"
      />

      <div className="space-y-6">
        {/* Punch In / Out Action Widget */}
        {statusQuery.isLoading ? (
          <AttendanceSkeleton />
        ) : statusQuery.isError ? (
          <AttendanceErrorState
            message={getAttendanceErrorMessage(statusQuery.error)}
            retry={() => statusQuery.refetch()}
          />
        ) : status ? (
          <EmployeeCheckInWidget
            onActionSuccess={handlePunchSuccess}
            status={status}
          />
        ) : null}

        {/* Today's Attendance Overview Card */}
        {todayRecord && (
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <CalendarDays aria-hidden="true" className="size-4 text-primary" />
                  Today&apos;s summary ({formatAttendanceDate(todayRecord.workDate)})
                </CardTitle>
                <AttendanceStatusBadge status={todayRecord.attendanceStatus} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                  <span className="text-muted-foreground uppercase text-[10px] tracking-wider block font-semibold">
                    Shift & Office
                  </span>
                  <span className="font-semibold text-foreground text-sm block">
                    {todayRecord.shiftSnapshot?.shiftName || "Assigned Shift"}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1">
                    <MapPin aria-hidden="true" className="size-3 text-primary" />
                    {todayRecord.officeSnapshot?.name || "Office location"}
                  </span>
                  {todayRecord.shiftSnapshot?.startTime && (
                    <span className="text-muted-foreground block text-[11px]">
                      Hours: {todayRecord.shiftSnapshot.startTime.slice(0, 5)} – {todayRecord.shiftSnapshot.endTime.slice(0, 5)}
                    </span>
                  )}
                </div>

                <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                  <span className="text-muted-foreground uppercase text-[10px] tracking-wider block font-semibold">
                    Worked duration
                  </span>
                  <span className="font-semibold text-foreground text-sm block">
                    {formatDurationMinutes(todayRecord.totalWorkedMinutes)}
                  </span>
                  <span className="text-muted-foreground block text-[11px]">
                    Expected: {todayRecord.shiftSnapshot ? formatDurationMinutes(8 * 60) : "8h"}
                  </span>
                  {todayRecord.overtimeMinutes > 0 && (
                    <span className="text-info font-medium block text-[11px]">
                      +{formatDurationMinutes(todayRecord.overtimeMinutes)} overtime
                    </span>
                  )}
                </div>

                <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                  <span className="text-muted-foreground uppercase text-[10px] tracking-wider block font-semibold">
                    Breaks taken
                  </span>
                  <span className="font-semibold text-foreground text-sm block">
                    {formatDurationMinutes(todayRecord.totalBreakMinutes)}
                  </span>
                  <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
                    <Coffee aria-hidden="true" className="size-3 text-primary" />
                    Calculated between punches
                  </span>
                </div>

                <div className="rounded-lg bg-muted/40 p-3 text-xs space-y-1">
                  <span className="text-muted-foreground uppercase text-[10px] tracking-wider block font-semibold">
                    Lateness / Departure
                  </span>
                  {todayRecord.lateByMinutes > 0 ? (
                    <span className="font-semibold text-warning text-sm block">
                      +{todayRecord.lateByMinutes}m late arrival
                    </span>
                  ) : (
                    <span className="font-semibold text-success text-sm block">
                      On time
                    </span>
                  )}
                  {todayRecord.earlyDepartureByMinutes > 0 && (
                    <span className="text-warning block text-[11px]">
                      Left {todayRecord.earlyDepartureByMinutes}m early
                    </span>
                  )}
                </div>
              </div>

              {/* Sessions List */}
              <div className="mt-4">
                <AttendanceSessionsCard sessions={todayRecord.sessions} title="Today's punch logs" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Attendance History Section */}
        <div className="space-y-4 pt-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-bold text-foreground">
              Attendance history
            </h3>
          </div>

          {/* Date Range Filters Bar */}
          <Card className="border-border">
            <CardContent className="p-4 sm:p-5">
              <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
                <div>
                  <Label className="text-xs font-semibold" htmlFor="history-from-date">
                    From work date
                  </Label>
                  <Input
                    className="mt-1.5"
                    id="history-from-date"
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setPage(0);
                    }}
                    type="date"
                    value={fromDate}
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold" htmlFor="history-to-date">
                    To work date
                  </Label>
                  <Input
                    className="mt-1.5"
                    id="history-to-date"
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setPage(0);
                    }}
                    type="date"
                    value={toDate}
                  />
                </div>

                <div className="flex items-center gap-2">
                  {(fromDate || toDate) && (
                    <Button
                      onClick={handleFilterReset}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      <RotateCcw aria-hidden="true" className="size-3.5 mr-1" />
                      Clear dates
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* History Query Rendering */}
          {historyQuery.isLoading ? (
            <AttendanceSkeleton />
          ) : historyQuery.isError ? (
            <AttendanceErrorState
              message={getAttendanceErrorMessage(historyQuery.error)}
              retry={() => historyQuery.refetch()}
            />
          ) : historyQuery.data ? (
            historyQuery.data.content.length === 0 ? (
              <AttendanceEmptyState
                description="No previous attendance logs found for this date range."
                title="No attendance records"
              />
            ) : (
              <div className="space-y-4">
                {/* Desktop Table */}
                <div className="hidden md:block">
                  <AttendanceTable records={historyQuery.data.content} />
                </div>

                {/* Mobile Cards */}
                <div className="grid gap-3 md:hidden">
                  {historyQuery.data.content.map((rec) => (
                    <AttendanceCard key={rec.id} record={rec} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {historyQuery.data.totalPages > 1 && (
                  <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                    <span>
                      Page {historyQuery.data.page + 1} of {historyQuery.data.totalPages} (
                      {historyQuery.data.totalElements} records)
                    </span>
                    <div className="flex items-center gap-2">
                      <Button
                        disabled={historyQuery.data.first}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        size="sm"
                        variant="outline"
                      >
                        Previous
                      </Button>
                      <Button
                        disabled={historyQuery.data.last}
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
      </div>
    </PageContainer>
  );
}

