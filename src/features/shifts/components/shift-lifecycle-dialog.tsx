"use client";

import { Ban, LoaderCircle, RotateCcw } from "lucide-react";
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
import { useDeactivateShift } from "@/features/shifts/hooks/use-deactivate-shift";
import { useReactivateShift } from "@/features/shifts/hooks/use-reactivate-shift";
import type { Shift } from "@/features/shifts/types/shift-types";
import { getShiftErrorMessage } from "@/features/shifts/utils/shift-errors";

export function ShiftLifecycleDialog({ shift }: { shift: Shift }) {
  const [open, setOpen] = useState(false);
  const deactivate = useDeactivateShift();
  const reactivate = useReactivateShift();
  const isInactive = shift.status === "INACTIVE";
  const mutation = isInactive ? reactivate : deactivate;
  const verb = isInactive ? "Reactivate" : "Deactivate";

  async function confirm() {
    try {
      await mutation.mutateAsync(shift.id);
      setOpen(false);
    } catch {
      // Error message remains visible inside dialog
    }
  }

  return (
    <AlertDialog
      onOpenChange={(next) => {
        setOpen(next);
        if (next) mutation.reset();
      }}
      open={open}
    >
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant={isInactive ? "outline" : "destructive"}
        >
          {isInactive ? (
            <RotateCcw aria-hidden="true" className="size-4" />
          ) : (
            <Ban aria-hidden="true" className="size-4" />
          )}
          {verb}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>{verb} shift?</AlertDialogTitle>
        <AlertDialogDescription>
          {verb} {shift.name} ({shift.shiftCode}).
          {isInactive
            ? " This makes the shift available for employee work assignments and attendance schedules again."
            : " The backend will reject this action if active employee assignments are still linked to this shift. End or reassign them first."}
        </AlertDialogDescription>
        <div className="mt-4 rounded-lg border border-border bg-muted/50 p-3 text-sm">
          Current status: <span className="font-semibold">{shift.status}</span>
        </div>
        {mutation.error && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {getShiftErrorMessage(mutation.error)}
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <AlertDialogClose asChild>
            <Button disabled={mutation.isPending} type="button" variant="outline">
              Cancel
            </Button>
          </AlertDialogClose>
          <Button
            disabled={mutation.isPending}
            onClick={confirm}
            type="button"
            variant={isInactive ? "default" : "destructive"}
          >
            {mutation.isPending && (
              <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
            )}
            {mutation.isPending ? `${verb}...` : `Yes, ${verb.toLowerCase()}`}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

