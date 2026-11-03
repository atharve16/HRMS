import { Clock, Navigation } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SessionStatusBadge } from "@/features/attendance/components/session-status-badge";
import type { AttendanceSession } from "@/features/attendance/types/attendance-types";
import {
  formatAttendanceTime,
  formatDistanceMeters,
  formatDurationMinutes,
  formatGpsAccuracy,
} from "@/features/attendance/utils/attendance-display";

export function AttendanceSessionsCard({
  sessions,
  title = "Attendance sessions",
}: {
  sessions: AttendanceSession[];
  title?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock aria-hidden="true" className="size-4 text-primary" />
            {title} ({sessions.length})
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground italic py-3">
            No punches or sessions recorded for this work date.
          </p>
        ) : (
          <div className="space-y-3">
            {sessions.map((session, index) => {
              const inTime = new Date(session.checkInAt).getTime();
              const outTime = session.checkOutAt
                ? new Date(session.checkOutAt).getTime()
                : null;
              const durationMinutes =
                outTime && outTime > inTime
                  ? Math.round((outTime - inTime) / 60000)
                  : 0;

              return (
                <div
                  className="rounded-lg border border-border bg-card/60 p-4 space-y-2 text-xs"
                  key={session.sessionId || index}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                    <span className="font-semibold text-foreground text-sm">
                      Session #{index + 1}
                    </span>
                    <SessionStatusBadge status={session.status} />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2 pt-1">
                    <div>
                      <span className="text-muted-foreground uppercase text-[10px] tracking-wider block">
                        Check-in
                      </span>
                      <span className="font-medium text-foreground text-sm">
                        {formatAttendanceTime(session.checkInAt)}
                      </span>
                      <div className="mt-1 flex items-center gap-1.5 text-muted-foreground text-[11px]">
                        <Navigation aria-hidden="true" className="size-3 text-primary shrink-0" />
                        <span>
                          {formatDistanceMeters(session.checkInDistanceMeters)} from office ({formatGpsAccuracy(session.checkInGpsAccuracyMeters)})
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-muted-foreground uppercase text-[10px] tracking-wider block">
                        Check-out
                      </span>
                      <span className="font-medium text-foreground text-sm">
                        {session.checkOutAt ? formatAttendanceTime(session.checkOutAt) : "Session in progress..."}
                      </span>
                      {session.checkOutAt && (
                        <div className="mt-1 flex items-center gap-1.5 text-muted-foreground text-[11px]">
                          <Navigation aria-hidden="true" className="size-3 text-primary shrink-0" />
                          <span>
                            {formatDistanceMeters(session.checkOutDistanceMeters)} from office ({formatGpsAccuracy(session.checkOutGpsAccuracyMeters)})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {outTime && (
                    <div className="border-t pt-2 text-muted-foreground flex items-center justify-between text-[11px]">
                      <span>Session duration:</span>
                      <span className="font-semibold text-foreground">
                        {formatDurationMinutes(durationMinutes)}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

