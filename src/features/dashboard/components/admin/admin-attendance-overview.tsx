import { AlertCircle, ArrowRight, Clock, ShieldCheck, TrendingUp } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { useAdminDashboard } from "@/features/dashboard/hooks/use-admin-dashboard";
import { formatDateShort, formatHoursMinutes } from "@/features/dashboard/utils/dashboard-time";
import { cn } from "@/lib/utils";

type AdminAttendanceOverviewProps = {
  dashboard: ReturnType<typeof useAdminDashboard>;
};

export function AdminAttendanceOverview({ dashboard }: AdminAttendanceOverviewProps) {
  const {
    today,
    todayAttendanceSummaryQuery,
    onLeaveTodayQuery,
    activeEmployeesQuery,
  } = dashboard;

  const isLoading =
    todayAttendanceSummaryQuery.isLoading ||
    onLeaveTodayQuery.isLoading ||
    activeEmployeesQuery.isLoading;
  const isError =
    todayAttendanceSummaryQuery.isError ||
    onLeaveTodayQuery.isError ||
    activeEmployeesQuery.isError;

  const summary = todayAttendanceSummaryQuery.data;
  const totalActive = activeEmployeesQuery.data?.totalElements ?? 0;
  const presentCount = summary?.presentCount ?? 0;
  const partialCount = summary?.partialCount ?? 0;
  const incompleteCount = summary?.incompleteCount ?? 0;
  const onLeaveCount = onLeaveTodayQuery.data?.totalElements ?? 0;
  const totalRecorded = summary?.totalRecords ?? 0;

  // Real percentage shares against active workforce
  const presentPct = totalActive > 0 ? Math.round((presentCount / totalActive) * 100) : 0;
  const partialPct = totalActive > 0 ? Math.round((partialCount / totalActive) * 100) : 0;
  const incompletePct = totalActive > 0 ? Math.round((incompleteCount / totalActive) * 100) : 0;
  const onLeavePct = totalActive > 0 ? Math.round((onLeaveCount / totalActive) * 100) : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Attendance overview</CardTitle>
          <CardDescription>
            Live attendance activity for today ({formatDateShort(today)}).
          </CardDescription>
        </div>
        <Link
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
          href="/admin/attendance"
        >
          View live roster
          <ArrowRight aria-hidden="true" className="size-3.5 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : isError ? (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive-soft p-4 text-sm text-destructive">
            <AlertCircle aria-hidden="true" className="size-5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load attendance summary</p>
              <p className="text-xs mt-0.5 text-muted-foreground">
                There was a problem communicating with the attendance service.
              </p>
            </div>
          </div>
        ) : totalRecorded === 0 && onLeaveCount === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            <Clock aria-hidden="true" className="mx-auto size-8 text-muted-foreground/60 mb-2" />
            <p className="font-medium text-foreground">No punches recorded yet today</p>
            <p className="text-xs text-muted-foreground mt-1">
              Employees have not punched in for today&apos;s shift yet.
            </p>
          </div>
        ) : (
          <>
            {/* Visual breakdown metrics */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg bg-success-soft/50 p-3 border border-success/20">
                <span className="text-xs font-medium text-success">Present</span>
                <p className="text-2xl font-bold text-foreground mt-1">{presentCount}</p>
                <span className="text-[11px] text-muted-foreground">{presentPct}% of active</span>
              </div>
              <div className="rounded-lg bg-warning-soft/50 p-3 border border-warning/20">
                <span className="text-xs font-medium text-warning">Partial Shift</span>
                <p className="text-2xl font-bold text-foreground mt-1">{partialCount}</p>
                <span className="text-[11px] text-muted-foreground">{partialPct}% of active</span>
              </div>
              <div className="rounded-lg bg-destructive-soft/50 p-3 border border-destructive/20">
                <span className="text-xs font-medium text-destructive">Incomplete</span>
                <p className="text-2xl font-bold text-foreground mt-1">{incompleteCount}</p>
                <span className="text-[11px] text-muted-foreground">{incompletePct}% of active</span>
              </div>
              <div className="rounded-lg bg-info-soft/50 p-3 border border-info/20">
                <span className="text-xs font-medium text-info">Approved Leave</span>
                <p className="text-2xl font-bold text-foreground mt-1">{onLeaveCount}</p>
                <span className="text-[11px] text-muted-foreground">{onLeavePct}% of active</span>
              </div>
            </div>

            {/* Progress distributions */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium">Full Attendance (Present)</span>
                  <span className="text-muted-foreground font-mono">{presentCount} ({presentPct}%)</span>
                </div>
                <Progress indicatorClassName="bg-success" label="Present percentage" value={presentPct} />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium">Partial Work Sessions</span>
                  <span className="text-muted-foreground font-mono">{partialCount} ({partialPct}%)</span>
                </div>
                <Progress indicatorClassName="bg-warning" label="Partial shift percentage" value={partialPct} />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium">Incomplete / Open Sessions</span>
                  <span className="text-muted-foreground font-mono">{incompleteCount} ({incompletePct}%)</span>
                </div>
                <Progress indicatorClassName="bg-destructive" label="Incomplete percentage" value={incompletePct} />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium">Employees On Scheduled Leave</span>
                  <span className="text-muted-foreground font-mono">{onLeaveCount} ({onLeavePct}%)</span>
                </div>
                <Progress indicatorClassName="bg-info" label="Leave percentage" value={onLeavePct} />
              </div>
            </div>

            {/* Time telemetry metrics */}
            <div className="mt-4 grid grid-cols-1 gap-2 border-t border-border pt-4 sm:grid-cols-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <TrendingUp aria-hidden="true" className="size-3.5 text-primary shrink-0" />
                <span>
                  Total time: <strong className="text-foreground">{formatHoursMinutes(summary?.totalWorkedMinutes)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock aria-hidden="true" className="size-3.5 text-warning shrink-0" />
                <span>
                  Late arrivals: <strong className="text-foreground">{formatHoursMinutes(summary?.totalLateMinutes)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck aria-hidden="true" className="size-3.5 text-success shrink-0" />
                <span>
                  Overtime: <strong className="text-foreground">{formatHoursMinutes(summary?.totalOvertimeMinutes)}</strong>
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

