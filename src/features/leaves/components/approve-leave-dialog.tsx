"use client";

import { AlertCircle, CheckCircle2, LoaderCircle } from "lucide-react";
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
import { useApproveLeave } from "@/features/leaves/hooks/use-leaves";
import type { LeaveRequestResponse } from "@/features/leaves/types/leave-types";
import {
  canAdminReview,
  formatDays,
  formatLeaveDateRange,
  LEAVE_TYPE_LABELS,
} from "@/features/leaves/utils/leave-display";
import { getLeaveErrorMessage } from "@/features/leaves/utils/leave-errors";

export function ApproveLeaveDialog({
  leave,
  trigger,
  onApproved,
}: {
  leave: LeaveRequestResponse;
  trigger?: React.ReactNode;
  onApproved?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const approveMutation = useApproveLeave();

  if (!canAdminReview(leave.status)) {
    return null;
  }

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(leave.id);
      setOpen(false);
      onApproved?.();
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button type="button" size="sm">
            <CheckCircle2 className="mr-1.5 size-3.5" />
            Approve
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogTitle>Approve leave request</AlertDialogTitle>
        <AlertDialogDescription>
          Approve this leave request for employee{" "}
          <strong className="text-foreground">{leave.employeeCode}</strong>.
          Reserved days will be deducted as used leave.
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
          <div className="flex justify-between">
            <span className="text-muted-foreground">Reason:</span>
            <span className="max-w-[200px] truncate text-foreground">
              {leave.reason}
            </span>
          </div>
        </div>

        {approveMutation.isError && (
          <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">Unable to approve leave</p>
              <p className="text-xs">
                {getLeaveErrorMessage(approveMutation.error)}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <AlertDialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={approveMutation.isPending}
            >
              Cancel
            </Button>
          </AlertDialogClose>
          <Button
            type="button"
            onClick={handleApprove}
            disabled={approveMutation.isPending}
          >
            {approveMutation.isPending && (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            )}
            Confirm approval
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

