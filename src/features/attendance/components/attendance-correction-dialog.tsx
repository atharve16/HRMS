"use client";

import { AlertCircle, Edit3, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCorrectAttendance } from "@/features/attendance/hooks/use-attendance";
import {
  attendanceCorrectionSchema,
  type AttendanceCorrectionFormValues,
} from "@/features/attendance/schemas/attendance-schemas";
import type { AttendanceResponse } from "@/features/attendance/types/attendance-types";
import {
  formatAttendanceDate,
  formatAttendanceTime,
} from "@/features/attendance/utils/attendance-display";
import { getAttendanceErrorMessage } from "@/features/attendance/utils/attendance-errors";

/**
 * Converts an ISO Instant string to "YYYY-MM-DDTHH:mm" for <input type="datetime-local">
 */
function toLocalDatetimeInput(isoString?: string | null): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return "";
    // Offset by local timezone
    const offsetMs = d.getTimezoneOffset() * 60000;
    const localTime = new Date(d.getTime() - offsetMs);
    return localTime.toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

/**
 * Converts "YYYY-MM-DDTHH:mm" from <input type="datetime-local"> back to ISO 8601 Instant
 */
function fromLocalDatetimeInput(localValue?: string | null): string | null {
  if (!localValue) return null;
  try {
    const d = new Date(localValue);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch {
    return null;
  }
}

export function AttendanceCorrectionDialog({
  attendance,
  trigger,
  onCorrected,
}: {
  attendance: AttendanceResponse;
  trigger?: React.ReactNode;
  onCorrected?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const initialSession = attendance.sessions[0];
  const [selectedSessionId, setSelectedSessionId] = useState<string>(
    initialSession?.sessionId ?? "",
  );

  const correctMutation = useCorrectAttendance(attendance.id);

  const form = useForm<AttendanceCorrectionFormValues>({
    resolver: zodResolver(attendanceCorrectionSchema),
    defaultValues: {
      sessionId: initialSession?.sessionId ?? "",
      correctedCheckInAt: initialSession?.checkInAt ?? "",
      correctedCheckOutAt: initialSession?.checkOutAt ?? "",
      reason: "",
    },
  });

  function handleSessionChange(sessionId: string) {
    setSelectedSessionId(sessionId);
    form.setValue("sessionId", sessionId);

    const session = attendance.sessions.find((s) => s.sessionId === sessionId);
    if (session) {
      form.setValue("correctedCheckInAt", session.checkInAt);
      form.setValue("correctedCheckOutAt", session.checkOutAt ?? "");
    }
  }

  async function onSubmit(data: AttendanceCorrectionFormValues) {
    setGeneralError(null);
    correctMutation.reset();

    const inIso = fromLocalDatetimeInput(data.correctedCheckInAt) || data.correctedCheckInAt;
    const outIso = data.correctedCheckOutAt?.trim()
      ? fromLocalDatetimeInput(data.correctedCheckOutAt) || data.correctedCheckOutAt
      : null;

    try {
      await correctMutation.mutateAsync({
        sessionId: data.sessionId,
        correctedCheckInAt: inIso,
        correctedCheckOutAt: outIso,
        reason: data.reason.trim(),
      });

      setOpen(false);
      onCorrected?.();
    } catch (err) {
      setGeneralError(getAttendanceErrorMessage(err));
    }
  }

  const selectedSession = attendance.sessions.find(
    (s) => s.sessionId === selectedSessionId,
  );

  return (
    <AlertDialog
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setGeneralError(null);
          correctMutation.reset();
          const sess = attendance.sessions[0];
          setSelectedSessionId(sess?.sessionId ?? "");
          form.reset({
            sessionId: sess?.sessionId ?? "",
            correctedCheckInAt: sess?.checkInAt ?? "",
            correctedCheckOutAt: sess?.checkOutAt ?? "",
            reason: "",
          });
        }
      }}
      open={open}
    >
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" type="button" variant="outline">
            <Edit3 aria-hidden="true" className="size-3.5" />
            Correct punch
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogTitle>Correct attendance session</AlertDialogTitle>
        <AlertDialogDescription>
          Adjust the check-in or check-out timestamps for{" "}
          <strong className="text-foreground">{attendance.employeeNameSnapshot}</strong> on{" "}
          <strong className="text-foreground">{formatAttendanceDate(attendance.workDate)}</strong>.
          An audit record will preserve the previous values and reason.
        </AlertDialogDescription>

        {generalError && (
          <div
            className="mt-3 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive-soft p-3 text-xs text-destructive"
            role="alert"
          >
            <AlertCircle aria-hidden="true" className="size-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Correction failed</p>
              <p className="mt-0.5">{generalError}</p>
            </div>
          </div>
        )}

        <form className="mt-4 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="session-select">Select session to correct *</Label>
            <Select
              className="mt-1.5"
              id="session-select"
              onChange={(e) => handleSessionChange(e.target.value)}
              value={selectedSessionId}
            >
              {attendance.sessions.map((s, idx) => (
                <option key={s.sessionId} value={s.sessionId}>
                  Session #{idx + 1} — In: {formatAttendanceTime(s.checkInAt)}, Out: {s.checkOutAt ? formatAttendanceTime(s.checkOutAt) : "Open"}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="checkInInput">Corrected Check-in *</Label>
              <Input
                className="mt-1.5"
                defaultValue={toLocalDatetimeInput(selectedSession?.checkInAt)}
                id="checkInInput"
                onChange={(e) => form.setValue("correctedCheckInAt", e.target.value)}
                type="datetime-local"
              />
              {form.formState.errors.correctedCheckInAt && (
                <p className="mt-1 text-xs text-destructive" role="alert">
                  {form.formState.errors.correctedCheckInAt.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="checkOutInput">Corrected Check-out (optional)</Label>
              <Input
                className="mt-1.5"
                defaultValue={toLocalDatetimeInput(selectedSession?.checkOutAt)}
                id="checkOutInput"
                onChange={(e) => form.setValue("correctedCheckOutAt", e.target.value)}
                type="datetime-local"
              />
              {form.formState.errors.correctedCheckOutAt && (
                <p className="mt-1 text-xs text-destructive" role="alert">
                  {form.formState.errors.correctedCheckOutAt.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="reasonInput">Audit reason for correction *</Label>
            <Textarea
              className="mt-1.5 resize-none"
              id="reasonInput"
              maxLength={1000}
              placeholder="Explain why this punch time was adjusted (e.g. system downtime, verified manager approval)..."
              rows={3}
              {...form.register("reason")}
            />
            {form.formState.errors.reason && (
              <p className="mt-1 text-xs text-destructive" role="alert">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <AlertDialogClose asChild>
              <Button disabled={correctMutation.isPending} type="button" variant="outline">
                Cancel
              </Button>
            </AlertDialogClose>
            <Button disabled={correctMutation.isPending} type="submit">
              {correctMutation.isPending && (
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin mr-2" />
              )}
              {correctMutation.isPending ? "Submitting correction..." : "Save correction"}
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

