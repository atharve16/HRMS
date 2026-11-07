import { ArrowRight, Clock } from "lucide-react";
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
import { AttendanceStatusBadge } from "@/features/attendance/components/attendance-status-badge";
import type { useEmployeeDashboard } from "@/features/dashboard/hooks/use-employee-dashboard";
import {
  formatDateShort,
  formatHoursMinutes,
  formatTimeShort,
} from "@/features/dashboard/utils/dashboard-time";
import { cn } from "@/lib/utils";

type EmployeeRecentAttendanceProps = {
  dashboard: ReturnType<typeof useEmployeeDashboard>;
};

export function EmployeeRecentAttendance({ dashboard }: EmployeeRecentAttendanceProps) {
  const { attendanceHistoryQuery } = dashboard;
  const records = attendanceHistoryQuery.data?.content ?? [];
  const isLoading = attendanceHistoryQuery.isLoading;
  const isError = attendanceHistoryQuery.isError;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Recent attendance</CardTitle>
          <CardDescription>Your logged work records for the past working days.</CardDescription>
        </div>
        <Link
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
          href="/employee/attendance"
        >
          View all history
          <ArrowRight aria-hidden="true" className="size-3.5 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : isError ? (
          <div className="p-6 text-xs text-destructive">
            Failed to load your attendance history.
          </div>
        ) : records.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            <Clock aria-hidden="true" className="mx-auto size-7 text-muted-foreground/60 mb-2" />
            <p className="font-medium text-foreground">No recent attendance history</p>
            <p className="mt-1">Recorded sessions will display here after you check in.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Check-in</TableHead>
                  <TableHead>Check-out</TableHead>
                  <TableHead>Hours Worked</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => {
                  const firstIn = record.sessions?.[0]?.checkInAt;
                  const completedSessions = (record.sessions ?? []).filter((s) => s.checkOutAt);
                  const lastOut = completedSessions[completedSessions.length - 1]?.checkOutAt;

                  return (
                    <TableRow key={record.id}>
                      <TableCell className="text-xs font-medium text-foreground">
                        {formatDateShort(record.workDate)}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {formatTimeShort(firstIn)}
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">
                        {formatTimeShort(lastOut)}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {formatHoursMinutes(record.totalWorkedMinutes)}
                      </TableCell>
                      <TableCell className="text-right">
                        <AttendanceStatusBadge status={record.attendanceStatus} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

