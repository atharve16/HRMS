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
import { useDeactivateHoliday } from "@/features/holidays/hooks/use-holidays";
import type { AdminHolidayResponse } from "@/features/holidays/types/holiday-types";
import { formatHolidayDate } from "@/features/holidays/utils/holiday-display";
import { getHolidayErrorMessage } from "@/features/holidays/utils/holiday-errors";

export function DeactivateHolidayDialog({
  holiday,
  trigger,
  onDeactivated,
}: {
  holiday: AdminHolidayResponse;
  trigger?: React.ReactNode;
  onDeactivated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const deactivateMutation = useDeactivateHoliday();

  if (!holiday.active) {
    return null;
  }

  const handleDeactivate = async () => {
    try {
      await deactivateMutation.mutateAsync(holiday.id);
      setOpen(false);
      onDeactivated?.();
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="outline" size="sm">
            <Ban className="mr-1.5 size-3.5 text-destructive" />
            Deactivate
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogTitle>Deactivate company holiday</AlertDialogTitle>
        <AlertDialogDescription>
          Are you sure you want to deactivate{" "}
          <strong className="text-foreground">{holiday.name}</strong> on{" "}
          <strong className="text-foreground">
            {formatHolidayDate(holiday.date)}
          </strong>
          ? This holiday will no longer be considered an active holiday or
          excluded from employee leave calculations. Reactivation is not supported.
        </AlertDialogDescription>

        {deactivateMutation.isError && (
          <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">Unable to deactivate holiday</p>
              <p className="text-xs">
                {getHolidayErrorMessage(deactivateMutation.error)}
              </p>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-end gap-3">
          <AlertDialogClose asChild>
            <Button
              type="button"
              variant="outline"
              disabled={deactivateMutation.isPending}
            >
              Cancel
            </Button>
          </AlertDialogClose>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDeactivate}
            disabled={deactivateMutation.isPending}
          >
            {deactivateMutation.isPending && (
              <LoaderCircle className="mr-2 size-4 animate-spin" />
            )}
            Confirm deactivation
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

