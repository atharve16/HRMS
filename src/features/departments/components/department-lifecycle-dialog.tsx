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
import { useDeactivateDepartment } from "@/features/departments/hooks/use-deactivate-department";
import { useReactivateDepartment } from "@/features/departments/hooks/use-reactivate-department";
import type { Department } from "@/features/departments/types/department-types";
import { getDepartmentErrorMessage } from "@/features/departments/utils/department-errors";

export function DepartmentLifecycleDialog({ department }: { department: Department }) {
  const [open, setOpen] = useState(false);
  const deactivate = useDeactivateDepartment();
  const reactivate = useReactivateDepartment();
  const isInactive = department.status === "INACTIVE";
  const mutation = isInactive ? reactivate : deactivate;
  const verb = isInactive ? "Reactivate" : "Deactivate";

  async function confirm() {
    try {
      await mutation.mutateAsync(department.id);
      setOpen(false);
    } catch {
      // The centralized mutation error remains visible in the dialog.
    }
  }

  return (
    <AlertDialog onOpenChange={(next) => { setOpen(next); if (next) mutation.reset(); }} open={open}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant={isInactive ? "outline" : "destructive"}>
          {isInactive ? <RotateCcw aria-hidden="true" className="size-4" /> : <Ban aria-hidden="true" className="size-4" />}
          {verb}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>{verb} department?</AlertDialogTitle>
        <AlertDialogDescription>
          {verb} {department.name} ({department.departmentCode}).
          {isInactive
            ? " This makes the department available for new employee assignments again."
            : " The backend will reject this action if active employees are still assigned. Reassign them first."}
        </AlertDialogDescription>
        <div className="mt-4 rounded-lg border border-border bg-muted/50 p-3 text-sm">Current status: <span className="font-semibold">{department.status}</span></div>
        {mutation.error && <p className="mt-4 text-sm text-destructive" role="alert">{getDepartmentErrorMessage(mutation.error)}</p>}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <AlertDialogClose asChild><Button disabled={mutation.isPending} type="button" variant="outline">Cancel</Button></AlertDialogClose>
          <Button disabled={mutation.isPending} onClick={confirm} type="button" variant={isInactive ? "default" : "destructive"}>
            {mutation.isPending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
            {mutation.isPending ? `${verb}...` : `Yes, ${verb.toLowerCase()}`}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
