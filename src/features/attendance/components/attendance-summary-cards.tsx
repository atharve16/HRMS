import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { AttendanceSummaryResponse } from "@/features/attendance/types/attendance-types";
import { formatDurationMinutes } from "@/features/attendance/utils/attendance-display";

export function AttendanceSummaryCards({
  summary,
}: {
  summary: AttendanceSummaryResponse;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total records</span>
            <Users aria-hidden="true" className="size-4 text-muted-foreground" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {summary.totalRecords.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Logged attendance days</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Present / Full days</span>
            <CheckCircle2 aria-hidden="true" className="size-4 text-success" />
          </div>
          <p className="mt-2 text-2xl font-bold text-success">
            {summary.presentCount.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {summary.partialCount} partial • {summary.incompleteCount} incomplete
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total worked time</span>
            <Clock aria-hidden="true" className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold text-foreground">
            {formatDurationMinutes(summary.totalWorkedMinutes)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Cumulative employee hours</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Late / Overtime</span>
            <AlertTriangle aria-hidden="true" className="size-4 text-warning" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {formatDurationMinutes(summary.totalLateMinutes)}
            </span>
            <span className="text-xs text-muted-foreground">late</span>
          </div>
          <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp aria-hidden="true" className="size-3 text-info" />
            <span>Overtime: {formatDurationMinutes(summary.totalOvertimeMinutes)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

