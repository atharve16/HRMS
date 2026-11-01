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
import { useDeactivateOfficeLocation } from "@/features/office-locations/hooks/use-deactivate-office-location";
import { useReactivateOfficeLocation } from "@/features/office-locations/hooks/use-reactivate-office-location";
import type { OfficeLocation } from "@/features/office-locations/types/office-location-types";
import { getOfficeLocationErrorMessage } from "@/features/office-locations/utils/office-location-errors";

export function OfficeLocationLifecycleDialog({
  officeLocation,
}: {
  officeLocation: OfficeLocation;
}) {
  const [open, setOpen] = useState(false);
  const deactivate = useDeactivateOfficeLocation();
  const reactivate = useReactivateOfficeLocation();
  const isInactive = officeLocation.status === "INACTIVE";
  const mutation = isInactive ? reactivate : deactivate;
  const verb = isInactive ? "Reactivate" : "Deactivate";

  async function confirm() {
    try {
      await mutation.mutateAsync(officeLocation.id);
      setOpen(false);
    } catch {
      // The centralized mutation error remains visible in the dialog.
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
        <AlertDialogTitle>{verb} office location?</AlertDialogTitle>
        <AlertDialogDescription>
          {verb} {officeLocation.name} ({officeLocation.locationCode}).
          {isInactive
            ? " This makes the office location available for employee assignments and attendance verification again."
            : " The backend will reject this action if active employee assignments are still linked to this location. End or reassign them first."}
        </AlertDialogDescription>
        <div className="mt-4 rounded-lg border border-border bg-muted/50 p-3 text-sm">
          Current status: <span className="font-semibold">{officeLocation.status}</span>
        </div>
        {mutation.error && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {getOfficeLocationErrorMessage(mutation.error)}
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

