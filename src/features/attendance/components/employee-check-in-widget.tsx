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
import { useCheckIn, useCheckOut } from "@/features/attendance/hooks/use-attendance";
import { useGeolocation } from "@/features/attendance/hooks/use-geolocation";
import type { AttendanceStatusResponse } from "@/features/attendance/types/attendance-types";
import {
  formatAttendanceDateTime,
  formatGpsAccuracy,
} from "@/features/attendance/utils/attendance-display";
import { getAttendanceErrorMessage } from "@/features/attendance/utils/attendance-errors";

export function EmployeeCheckInWidget({
  status,
  onActionSuccess,
}: {
  status: AttendanceStatusResponse;
  onActionSuccess?: () => void;
}) {
  const [actionError, setActionError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const { captureLocation, isCapturing, location } = useGeolocation();
  const checkInMutation = useCheckIn();
  const checkOutMutation = useCheckOut();

  const isSubmitting = checkInMutation.isPending || checkOutMutation.isPending;
  const isPending = isCapturing || isSubmitting;
  const hasActiveSession = status.activeSession;

  async function handleCheckIn() {
    setActionError(null);
    setSuccessNotice(null);

    try {
      // 1. Capture browser GPS
      const coords = await captureLocation();

      // 2. Submit to backend check-in endpoint
      await checkInMutation.mutateAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracyMeters: coords.accuracyMeters,
      });

      setSuccessNotice("Check-in recorded successfully! Your attendance session is now active.");
      onActionSuccess?.();
    } catch (err) {
      setActionError(getAttendanceErrorMessage(err));
    }
  }

  async function handleCheckOut() {
    setActionError(null);
    setSuccessNotice(null);

    try {
      // 1. Capture browser GPS
      const coords = await captureLocation();

      // 2. Submit to backend check-out endpoint
      await checkOutMutation.mutateAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracyMeters: coords.accuracyMeters,
      });

      setSuccessNotice("Check-out recorded successfully! Your session is marked as completed.");
      onActionSuccess?.();
    } catch (err) {
      setActionError(getAttendanceErrorMessage(err));
    }
  }

  return (
    <Card className="border-border overflow-hidden">
      <CardContent className="p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Attendance punch clock
              </span>
              {hasActiveSession ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-2 py-0.5 text-xs font-medium text-warning animate-pulse">
                  <span className="size-1.5 rounded-full bg-warning" />
                  Active session in progress
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                  Session idle
                </span>
              )}
            </div>

            <h2 className="text-2xl font-bold text-foreground">
              {hasActiveSession ? "You are currently checked in" : "Ready to start your work session?"}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
              {status.lastCheckInAt && (
                <span className="inline-flex items-center gap-1">
                  <Clock aria-hidden="true" className="size-3.5 text-primary" />
                  Last check-in: {formatAttendanceDateTime(status.lastCheckInAt)}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <ShieldCheck aria-hidden="true" className="size-3.5 text-success" />
                Office geofence GPS verification required
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
                {isCapturing ? "Verifying GPS..." : isSubmitting ? "Recording check-in..." : "Check In"}
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
                {isCapturing ? "Verifying GPS..." : isSubmitting ? "Recording check-out..." : "Check Out"}
              </Button>
            )}
          </div>
        </div>

        {/* GPS location telemetry badge when captured */}
        {location && (
          <div className="mt-4 flex items-center gap-2 rounded-md bg-muted/40 p-2.5 text-xs text-muted-foreground">
            <Navigation aria-hidden="true" className="size-3.5 text-primary shrink-0" />
            <span>
              Captured GPS: {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)} ({formatGpsAccuracy(location.accuracyMeters)})
            </span>
          </div>
        )}

        {/* Success Feedback */}
        {successNotice && (
          <div
            className="mt-4 flex items-start gap-2.5 rounded-lg border border-success/20 bg-success-soft p-3 text-xs text-success"
            role="status"
          >
            <CheckCircle2 aria-hidden="true" className="size-4 shrink-0 mt-0.5" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Error Feedback */}
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

