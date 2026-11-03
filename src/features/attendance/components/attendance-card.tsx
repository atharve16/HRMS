import { ArrowRight, Calendar, Clock } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AttendanceCorrectionDialog } from "@/features/attendance/components/attendance-correction-dialog";
import { AttendanceStatusBadge } from "@/features/attendance/components/attendance-status-badge";
import type { AttendanceResponse } from "@/features/attendance/types/attendance-types";
import {
  formatAttendanceDate,
  formatAttendanceTime,
  formatDurationMinutes,
} from "@/features/attendance/utils/attendance-display";
import { cn } from "@/lib/utils";

export function AttendanceCard({
  record,
  isAdmin = false,
}: {
  record: AttendanceResponse;
  isAdmin?: boolean;
}) {
  const firstIn = record.sessions[0]?.checkInAt;
  const completedSessions = record.sessions.filter((s) => s.checkOutAt);
  const lastOut = completedSessions[completedSessions.length - 1]?.checkOutAt;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            {isAdmin && (
              <p className="font-semibold text-foreground text-sm">
                {record.employeeNameSnapshot || record.employeeId}{" "}
                <span className="font-mono text-xs text-muted-foreground font-normal">
                  ({record.employeeCodeSnapshot})
                </span>
              </p>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Calendar aria-hidden="true" className="size-3.5 shrink-0" />
              <span className="font-medium text-foreground">
                {formatAttendanceDate(record.workDate)}
              </span>
            </div>
          </div>
          <AttendanceStatusBadge status={record.attendanceStatus} />
        </div>

        <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/40 p-2.5 text-xs">
          <div>
            <span className="text-[10px] uppercase text-muted-foreground block">
              First In
            </span>
            <span className="font-medium text-foreground">
              {formatAttendanceTime(firstIn)}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase text-muted-foreground block">
              Last Out
            </span>
            <span className="font-medium text-foreground">
              {formatAttendanceTime(lastOut)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock aria-hidden="true" className="size-3.5 text-primary" />
            <span>Worked: <strong className="text-foreground">{formatDurationMinutes(record.totalWorkedMinutes)}</strong></span>
            {record.lateByMinutes > 0 && (
              <span className="text-warning text-[11px]">({record.lateByMinutes}m late)</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {isAdmin && (
              <>
                <Link
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs px-2")}
                  href={`/admin/attendance/${record.id}`}
                >
                  Details
                  <ArrowRight aria-hidden="true" className="size-3 ml-1" />
                </Link>
                {record.sessions.length > 0 && (
                  <AttendanceCorrectionDialog attendance={record} />
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

