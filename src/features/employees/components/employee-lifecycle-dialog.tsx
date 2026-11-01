"use client";

import { LoaderCircle, UserCheck, UserX } from "lucide-react";
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
import { useDeactivateEmployee } from "@/features/employees/hooks/use-deactivate-employee";
import { useReactivateEmployee } from "@/features/employees/hooks/use-reactivate-employee";
import type { Employee } from "@/features/employees/types/employee-types";
import { employeeFullName } from "@/features/employees/utils/employee-display";
import { getEmployeeErrorMessage } from "@/features/employees/utils/employee-errors";

export function EmployeeLifecycleDialog({
  employee,
  compact = false,
}: {
  employee: Employee;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const deactivate = useDeactivateEmployee();
  const reactivate = useReactivateEmployee();
  const isInactive = employee.employmentStatus === "INACTIVE";
  const unavailable = employee.employmentStatus === "TERMINATED";
  const mutation = isInactive ? reactivate : deactivate;
  const verb = isInactive ? "Reactivate" : "Deactivate";

  async function confirm() {
    try {
      await mutation.mutateAsync(employee.id);
      setOpen(false);
    } catch {
      // The mutation error is displayed inside the dialog.
    }
  }

  return (
    <AlertDialog onOpenChange={(next) => {
      setOpen(next);
      if (next) mutation.reset();
    }} open={open}>
      <AlertDialogTrigger asChild>
        <Button
          disabled={unavailable}
          size={compact ? "sm" : "default"}
          type="button"
          variant={isInactive ? "outline" : "destructive"}
        >
          {isInactive ? <UserCheck aria-hidden="true" className="size-4" /> : <UserX aria-hidden="true" className="size-4" />}
          {verb}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>{verb} employee?</AlertDialogTitle>
        <AlertDialogDescription>
          {verb} {employeeFullName(employee)} ({employee.employeeCode}).
          {isInactive
            ? " This restores their employee account to active status."
            : " This prevents normal employee access until an administrator reactivates the record."}
        </AlertDialogDescription>
        <div className="mt-4 rounded-lg border border-border bg-muted/50 p-3 text-sm">
          Current status: <span className="font-semibold">{employee.employmentStatus}</span>
        </div>
        {mutation.error && (
          <p className="mt-4 text-sm text-destructive" role="alert">
            {getEmployeeErrorMessage(mutation.error)}
          </p>
        )}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <AlertDialogClose asChild>
            <Button disabled={mutation.isPending} type="button" variant="outline">Cancel</Button>
          </AlertDialogClose>
          <Button
            disabled={mutation.isPending}
            onClick={confirm}
            type="button"
            variant={isInactive ? "default" : "destructive"}
          >
            {mutation.isPending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
            {mutation.isPending ? `${verb}...` : `Yes, ${verb.toLowerCase()}`}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
