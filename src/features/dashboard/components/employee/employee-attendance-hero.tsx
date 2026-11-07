"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  LoaderCircle,
  LogIn,
  LogOut,
  Navigation,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendanceStatusBadge } from "@/features/attendance/components/attendance-status-badge";
import { useCheckIn, useCheckOut } from "@/features/attendance/hooks/use-attendance";
import { useGeolocation } from "@/features/attendance/hooks/use-geolocation";
import { getAttendanceErrorMessage } from "@/features/attendance/utils/attendance-errors";
import { formatGpsAccuracy } from "@/features/attendance/utils/attendance-display";
import type { useEmployeeDashboard } from "@/features/dashboard/hooks/use-employee-dashboard";
import {
  formatDateShort,
  formatHoursMinutes,
  formatTimeShort,
} from "@/features/dashboard/utils/dashboard-time";

type EmployeeAttendanceHeroProps = {
  dashboard: ReturnType<typeof useEmployeeDashboard>;
};

export function EmployeeAttendanceHero({ dashboard }: EmployeeAttendanceHeroProps) {
  const { attendanceStatusQuery } = dashboard;
  const status = attendanceStatusQuery.data;
  const isLoading = attendanceStatusQuery.isLoading;

  const [actionError, setActionError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const { captureLocation, isCapturing, location } = useGeolocation();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const isSubmitting = checkInMutation.isPending || checkOutMutation.isPending;
  const isPending = isCapturing || isSubmitting;

  const hasActiveSession = Boolean(status?.activeSession);
  const attendance = status?.attendance;
  const sessions = attendance?.sessions ?? [];
  const openSession = sessions.find((s) => s.status === "OPEN");

  async function handleCheckIn() {
    setActionError(null);
    setSuccessNotice(null);

    try {
      const coords = await captureLocation();
      await checkInMutation.mutateAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracyMeters: coords.accuracyMeters,
      });

      setSuccessNotice("Check-in recorded successfully! Your attendance session is now active.");
      await attendanceStatusQuery.refetch();
    } catch (err) {
      setActionError(getAttendanceErrorMessage(err));
    }
  }

  async function handleCheckOut() {
    setActionError(null);
    setSuccessNotice(null);

    try {
      const coords = await captureLocation();
      await checkOutMutation.mutateAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracyMeters: coords.accuracyMeters,
      });

      setSuccessNotice("Check-out recorded successfully! Session marked as completed.");
      await attendanceStatusQuery.refetch();
    } catch (err) {
      setActionError(getAttendanceErrorMessage(err));
    }
  }

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-10 w-96" />
          <Skeleton className="h-8 w-64" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-border bg-card">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Attendance punch desk
              </span>
              {hasActiveSession ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2.5 py-0.5 text-xs font-medium text-warning animate-pulse">
                  <span className="size-1.5 rounded-full bg-warning" />
                  Active session in progress
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                  Session idle
                </span>
              )}
              {attendance?.attendanceStatus && (
                <AttendanceStatusBadge status={attendance.attendanceStatus} />
              )}
            </div>

            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              {hasActiveSession
                ? "You are currently checked in"
                : "Ready to start your work session?"}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              {openSession?.checkInAt ? (
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <Clock aria-hidden="true" className="size-3.5 text-primary" />
                  Checked in at: {formatTimeShort(openSession.checkInAt)}
                </span>
              ) : status?.lastCheckInAt ? (
                <span className="inline-flex items-center gap-1">
                  <Clock aria-hidden="true" className="size-3.5 text-muted-foreground" />
                  Last punch: {formatTimeShort(status.lastCheckInAt)}
                </span>
              ) : null}

              {attendance?.workDate && (
                <span className="inline-flex items-center gap-1">
                  Work date: <strong className="text-foreground">{formatDateShort(attendance.workDate)}</strong>
                </span>
              )}

              {attendance?.totalWorkedMinutes !== undefined && attendance.totalWorkedMinutes > 0 && (
                <span className="inline-flex items-center gap-1">
                  Logged today: <strong className="text-foreground">{formatHoursMinutes(attendance.totalWorkedMinutes)}</strong>
                </span>
              )}

              <span className="inline-flex items-center gap-1">
                <ShieldCheck aria-hidden="true" className="size-3.5 text-success" />
                Office geofence GPS required
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            {!hasActiveSession ? (
              <Button
                className="h-12 px-6 font-semibold shadow-sm"
                disabled={isPending}
                onClick={handleCheckIn}
                size="lg"
                type="button"
              >
                {isPending ? (
                  <LoaderCircle aria-hidden="true" className="size-5 animate-spin mr-2" />
                ) : (
                  <LogIn aria-hidden="true" className="size-5 mr-2" />
                )}
                {isCapturing ? "Verifying GPS..." : isSubmitting ? "Recording punch..." : "Check In"}
              </Button>
            ) : (
              <Button
                className="h-12 px-6 font-semibold shadow-sm"
                disabled={isPending}
                onClick={handleCheckOut}
                size="lg"
                type="button"
                variant="destructive"
              >
                {isPending ? (
                  <LoaderCircle aria-hidden="true" className="size-5 animate-spin mr-2" />
                ) : (
                  <LogOut aria-hidden="true" className="size-5 mr-2" />
                )}
                {isCapturing ? "Verifying GPS..." : isSubmitting ? "Recording punch..." : "Check Out"}
              </Button>
            )}
          </div>
        </div>

        {/* GPS telemetry */}
        {location && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-muted/40 p-2.5 text-xs text-muted-foreground">
            <Navigation aria-hidden="true" className="size-3.5 text-primary shrink-0" />
            <span>
              GPS verified: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)} ({formatGpsAccuracy(location.accuracyMeters)})
            </span>
          </div>
        )}

        {/* Success message */}
        {successNotice && (
          <div
            className="mt-4 flex items-start gap-2.5 rounded-lg border border-success/20 bg-success-soft p-3 text-xs text-success"
            role="status"
          >
            <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 mt-0.5" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Error message */}
        {actionError && (
          <div
            className="mt-4 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive-soft p-3 text-xs text-destructive"
            role="alert"
          >
            <AlertCircle aria-hidden="true" className="size-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to record punch</p>
              <p className="mt-0.5">{actionError}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

