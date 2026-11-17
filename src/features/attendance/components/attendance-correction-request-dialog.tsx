"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, LoaderCircle, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";

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
import { useSubmitAttendanceCorrection } from "@/features/attendance/hooks/use-attendance";
import {
  attendanceCorrectionRequestSchema,
  type AttendanceCorrectionRequestFormValues,
} from "@/features/attendance/schemas/attendance-schemas";
import { getAttendanceErrorMessage } from "@/features/attendance/utils/attendance-errors";

export interface AttendanceCorrectionRequestDialogProps {
  initialDate?: string;
  initialMissingPunch?: "CHECK_IN" | "CHECK_OUT" | "BOTH";
  trigger?: React.ReactNode;
  onSubmitted?: () => void;
}

export function AttendanceCorrectionRequestDialog({
  initialDate,
  initialMissingPunch = "CHECK_IN",
  trigger,
  onSubmitted,
}: AttendanceCorrectionRequestDialogProps) {
  const [open, setOpen] = useState(false);
  const mutation = useSubmitAttendanceCorrection();

  const form = useForm<AttendanceCorrectionRequestFormValues>({
    resolver: zodResolver(attendanceCorrectionRequestSchema),
    defaultValues: {
      attendanceDate: initialDate || new Date().toISOString().slice(0, 10),
      missingPunch: initialMissingPunch,
      requestedCheckInTime: "",
      requestedCheckOutTime: "",
      reason: "",
    },
  });

  const missing = useWatch({ control: form.control, name: "missingPunch" });

  useEffect(() => {
    if (open) {
      form.reset({
        attendanceDate: initialDate || new Date().toISOString().slice(0, 10),
        missingPunch: initialMissingPunch,
        requestedCheckInTime: "",
        requestedCheckOutTime: "",
        reason: "",
      });
      mutation.reset();
    }
  }, [open, initialDate, initialMissingPunch, form, mutation]);

  async function submit(values: AttendanceCorrectionRequestFormValues) {
    try {
      await mutation.mutateAsync(values);
      setOpen(false);
      form.reset({
        attendanceDate: initialDate || new Date().toISOString().slice(0, 10),
        missingPunch: initialMissingPunch,
        requestedCheckInTime: "",
        requestedCheckOutTime: "",
        reason: "",
      });
      onSubmitted?.();
    } catch {
      // mutation error is displayed below
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          mutation.reset();
        }
      }}
    >
      <AlertDialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button>
            <Plus className="mr-1.5 size-4" />
            Request Attendance Correction
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogTitle>Request attendance correction</AlertDialogTitle>
        <AlertDialogDescription>
          Submit a request for a missing punch. Existing timestamps cannot be edited directly through this workflow.
        </AlertDialogDescription>

        {mutation.isError && (
          <div className="mt-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mr-2 inline size-4" />
            {getAttendanceErrorMessage(mutation.error)}
          </div>
        )}

        <form className="mt-4 space-y-4" onSubmit={form.handleSubmit(submit)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="correction-date">Attendance date</Label>
              <Input
                id="correction-date"
                type="date"
                {...form.register("attendanceDate")}
              />
              {form.formState.errors.attendanceDate && (
                <p className="text-xs text-destructive mt-1">
                  {form.formState.errors.attendanceDate.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="missing-punch">Missing timing</Label>
              <Select id="missing-punch" {...form.register("missingPunch")}>
                <option value="CHECK_IN">Missing Check-in</option>
                <option value="CHECK_OUT">Missing Check-out</option>
                <option value="BOTH">Both Check-in and Check-out</option>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {missing !== "CHECK_OUT" && (
              <div>
                <Label htmlFor="requested-check-in">Requested check-in</Label>
                <Input
                  id="requested-check-in"
                  type="time"
                  {...form.register("requestedCheckInTime")}
                />
                {form.formState.errors.requestedCheckInTime && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.requestedCheckInTime.message}
                  </p>
                )}
              </div>
            )}
            {missing !== "CHECK_IN" && (
              <div>
                <Label htmlFor="requested-check-out">Requested check-out</Label>
                <Input
                  id="requested-check-out"
                  type="time"
                  {...form.register("requestedCheckOutTime")}
                />
                {form.formState.errors.requestedCheckOutTime && (
                  <p className="text-xs text-destructive mt-1">
                    {form.formState.errors.requestedCheckOutTime.message}
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="correction-reason">Reason</Label>
            <Textarea
              id="correction-reason"
              maxLength={1000}
              placeholder="Explain why the punch was missed"
              rows={3}
              {...form.register("reason")}
            />
            {form.formState.errors.reason && (
              <p className="text-xs text-destructive mt-1">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <AlertDialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </AlertDialogClose>
            <Button disabled={mutation.isPending} type="submit">
              {mutation.isPending && (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              )}
              Submit request
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
