"use client";

import { RotateCcw } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AttendanceCard } from "@/features/attendance/components/attendance-card";
import {
  AttendanceEmptyState,
  AttendanceErrorState,
  AttendanceSkeleton,
} from "@/features/attendance/components/attendance-query-state";
import { AttendanceTable } from "@/features/attendance/components/attendance-table";
import { useEmployeeAttendance } from "@/features/attendance/hooks/use-attendance";
import { getAttendanceErrorMessage } from "@/features/attendance/utils/attendance-errors";

export function EmployeeAttendanceHistoryPanel({
  employeeId,
  employeeName,
}: {
  employeeId: string;
  employeeName?: string;
}) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(0);

  const query = useEmployeeAttendance(employeeId, {
    fromDate: fromDate || undefined,
    toDate: toDate || undefined,
    page,
    limit: 10,
    sortBy: "workDate",
    sortDirection: "desc",
  });

  function handleReset() {
    setFromDate("");
    setToDate("");
    setPage(0);
  }

  const hasFilter = Boolean(fromDate || toDate);

  return (
    <div className="space-y-4">
      {/* Date filter card */}
      <Card className="border-border">
        <CardContent className="p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-3 sm:items-end">
            <div>
              <Label className="text-xs font-semibold" htmlFor="emp-att-from">
                From date
              </Label>
              <Input
                className="mt-1.5"
                id="emp-att-from"
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(0);
                }}
                type="date"
                value={fromDate}
              />
            </div>

            <div>
              <Label className="text-xs font-semibold" htmlFor="emp-att-to">
                To date
              </Label>
              <Input
                className="mt-1.5"
                id="emp-att-to"
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(0);
                }}
                type="date"
                value={toDate}
              />
            </div>

            <div>
              {hasFilter && (
                <Button onClick={handleReset} size="sm" type="button" variant="outline">
                  <RotateCcw aria-hidden="true" className="size-3.5 mr-1" />
                  Clear dates
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Query Results */}
      {query.isLoading ? (
        <AttendanceSkeleton />
      ) : query.isError ? (
        <AttendanceErrorState
          message={getAttendanceErrorMessage(query.error)}
          retry={() => query.refetch()}
        />
      ) : query.data ? (
        query.data.content.length === 0 ? (
          <AttendanceEmptyState
            description={
              hasFilter
                ? "No attendance records found for the selected date range."
                : `No attendance records logged for ${employeeName || "this employee"} yet.`
            }
            title="No attendance records"
          />
        ) : (
          <div className="space-y-4">
            <div className="hidden md:block">
              <AttendanceTable isAdmin={true} records={query.data.content} />
            </div>

            <div className="grid gap-3 md:hidden">
              {query.data.content.map((rec) => (
                <AttendanceCard isAdmin={true} key={rec.id} record={rec} />
              ))}
            </div>

            {query.data.totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground">
                <span>
                  Page {query.data.page + 1} of {query.data.totalPages} (
                  {query.data.totalElements} records)
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    disabled={query.data.first}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    size="sm"
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <Button
                    disabled={query.data.last}
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
  );
}

