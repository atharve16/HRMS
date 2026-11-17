import { MapPin } from "lucide-react";
import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AttendanceCorrectionRequestDialog } from "@/features/attendance/components/attendance-correction-request-dialog";
import { AttendanceStatusBadge } from "@/features/attendance/components/attendance-status-badge";
import type { AttendanceResponse } from "@/features/attendance/types/attendance-types";
import {
  formatAttendanceDate,
  formatAttendanceTime,
  formatDurationMinutes,
} from "@/features/attendance/utils/attendance-display";
import { cn } from "@/lib/utils";

export function AttendanceTable({
  records,
  isAdmin = false,
}: {
  records: AttendanceResponse[];
  isAdmin?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {isAdmin && <TableHead>Employee</TableHead>}
            <TableHead>Work date</TableHead>
            <TableHead>Shift</TableHead>
            <TableHead>First check-in</TableHead>
            <TableHead>Last check-out</TableHead>
            <TableHead>Worked time</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map((record) => {
            const firstIn = record.sessions[0]?.checkInAt;
            const completedSessions = record.sessions.filter((s) => s.checkOutAt);
            const lastOut = completedSessions[completedSessions.length - 1]?.checkOutAt;
            const isIncomplete =
              record.sessions.some((s) => s.status === "INCOMPLETE_CHECKOUT") ||
              record.attendanceStatus === "HALF_DAY";

            return (
              <TableRow key={record.id}>
                {isAdmin && (
                  <TableCell>
                    <div>
                      <span className="font-semibold text-foreground text-sm block">
                        {record.employeeNameSnapshot || record.employeeId}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        {record.employeeCodeSnapshot}
                      </span>
                    </div>
                  </TableCell>
                )}
                <TableCell className="font-medium text-foreground whitespace-nowrap">
                  {formatAttendanceDate(record.workDate)}
                </TableCell>
                <TableCell>
                  <span className="text-xs text-foreground block font-medium">
                    {record.shiftSnapshot?.shiftName || "Standard shift"}
                  </span>
                  {record.officeSnapshot?.name && (
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin aria-hidden="true" className="size-3 text-muted-foreground" />
                      {record.officeSnapshot.name}
                    </span>
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {formatAttendanceTime(firstIn)}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {isIncomplete ? (
                    <span className="font-semibold text-destructive">Incomplete Checkout</span>
                  ) : (
                    formatAttendanceTime(lastOut)
                  )}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  <div className="text-sm font-medium text-foreground">
                    {isIncomplete ? "00:00" : formatDurationMinutes(record.totalWorkedMinutes)}
                  </div>
                  {!isIncomplete && record.lateByMinutes > 0 && (
                    <span className="text-[11px] text-warning block">
                      +{record.lateByMinutes}m late
                    </span>
                  )}
                  {!isIncomplete && record.overtimeMinutes > 0 && (
                    <span className="text-[11px] text-info block">
                      +{formatDurationMinutes(record.overtimeMinutes)} OT
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <AttendanceStatusBadge status={record.attendanceStatus} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isAdmin ? (
                      <>
                        <Link
                          className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs")}
                          href={`/admin/attendance/${record.id}`}
                        >
                          Details
                        </Link>
                      </>
                    ) : isIncomplete ? (
                      <AttendanceCorrectionRequestDialog
                        initialDate={record.workDate}
                        initialMissingPunch="CHECK_OUT"
                        trigger={
                          <Button size="sm" variant="outline" className="text-xs">
                            Request Checkout Correction
                          </Button>
                        }
                      />
                    ) : (
                      <span className="text-xs text-muted-foreground">
                        {record.sessions.length} session{record.sessions.length === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
