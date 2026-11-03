"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, LoaderCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useRejectLeave } from "@/features/leaves/hooks/use-leaves";
import {
  rejectLeaveSchema,
  type RejectLeaveFormValues,
} from "@/features/leaves/schemas/leave-schemas";
import type { LeaveRequestResponse } from "@/features/leaves/types/leave-types";
import {
  canAdminReview,
  formatDays,
  formatLeaveDateRange,
  LEAVE_TYPE_LABELS,
} from "@/features/leaves/utils/leave-display";
import { getLeaveErrorMessage } from "@/features/leaves/utils/leave-errors";

export function RejectLeaveDialog({
  leave,
  trigger,
  onRejected,
}: {
  leave: LeaveRequestResponse;
  trigger?: React.ReactNode;
  onRejected?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const rejectMutation = useRejectLeave();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RejectLeaveFormValues>({
    resolver: zodResolver(rejectLeaveSchema),
    defaultValues: {
      remarks: "",
    },
  });

  if (!canAdminReview(leave.status)) {
    return null;
  }

  const onSubmit = async (values: RejectLeaveFormValues) => {
    try {
      await rejectMutation.mutateAsync({
        leaveId: leave.id,
        request: values,
      });
      reset();
      setOpen(false);
      onRejected?.();
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="outline" size="sm">
            <XCircle className="mr-1.5 size-3.5 text-destructive" />
            Reject
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogTitle>Reject leave request</AlertDialogTitle>
        <AlertDialogDescription>
          Provide rejection remarks for employee{" "}
          <strong className="text-foreground">{leave.employeeCode}</strong>.
          Reserved days will be released back to the employee&apos;s available
          balance.
        </AlertDialogDescription>

        <div className="mt-3 rounded-lg border bg-muted/40 p-3 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Employee:</span>
            <span className="font-semibold text-foreground">
              {leave.employeeCode}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span className="font-semibold text-foreground">
              {leave.leaveTypeName || LEAVE_TYPE_LABELS[leave.leaveType]}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Dates:</span>
            <span className="font-semibold text-foreground">
              {formatLeaveDateRange(leave.startDate, leave.endDate)} (
              {formatDays(leave.totalDays)})
            </span>
          </div>
        </div>

        {rejectMutation.isError && (
          <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">Unable to reject leave</p>
              <p className="text-xs">
                {getLeaveErrorMessage(rejectMutation.error)}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="remarks">Rejection remarks</Label>
            <Textarea
              id="remarks"
              placeholder="State the reason for rejecting this leave request..."
              rows={3}
              {...register("remarks")}
              aria-invalid={Boolean(errors.remarks)}
            />
            {errors.remarks && (
              <p className="text-xs text-destructive">
                {errors.remarks.message}
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <AlertDialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={rejectMutation.isPending}
              >
                Cancel
              </Button>
            </AlertDialogClose>
            <Button
              type="submit"
              variant="destructive"
              disabled={rejectMutation.isPending}
            >
              {rejectMutation.isPending && (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              )}
              Confirm rejection
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

