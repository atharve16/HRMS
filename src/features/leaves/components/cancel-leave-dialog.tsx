"use client";

import { AlertCircle, Ban, LoaderCircle } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogClose,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useCancelLeave } from "@/features/leaves/hooks/use-leaves";
import type { LeaveRequestResponse } from "@/features/leaves/types/leave-types";
import {
  canEmployeeCancel,
  formatDays,
  formatLeaveDateRange,
  LEAVE_TYPE_LABELS,
} from "@/features/leaves/utils/leave-display";
import { getLeaveErrorMessage } from "@/features/leaves/utils/leave-errors";

export function CancelLeaveDialog({
  leave,
  trigger,
  onCancelled,
}: {
  leave: LeaveRequestResponse;
  trigger?: React.ReactNode;
  onCancelled?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const cancelMutation = useCancelLeave();

  if (!canEmployeeCancel(leave.status)) {
    return null;
  }

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(leave.id);
      setOpen(false);
      onCancelled?.();
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="outline" size="sm">
            <Ban className="mr-1.5 size-3.5 text-muted-foreground" />
            Cancel request
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogTitle>Cancel leave request</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to cancel this leave application? Reserved leave
          days will be returned to your available balance.
        </AlertDialogDescription>

        <div className="mt-3 rounded-lg border bg-muted/40 p-3 text-xs space-y-1.5">
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
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reason:</span>
            <span className="max-w-[200px] truncate text-foreground">
              {leave.reason}
            </span>
          </div>
        </div>

        {cancelMutation.isError && (
          <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">Unable to cancel leave</p>
              <p className="text-xs">
                {getLeaveErrorMessage(cancelMutation.error)}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <AlertDialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={cancelMutation.isPending}
            >
              Keep request
            </Button>
          </AlertDialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelMutation.isPending}
          >
            {cancelMutation.isPending && (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            )}
            Confirm cancellation
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

