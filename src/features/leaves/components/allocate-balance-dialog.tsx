"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Coins, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useAllocateLeaveBalance } from "@/features/leaves/hooks/use-leaves";
import {
  allocateBalanceSchema,
  type AllocateBalanceFormValues,
} from "@/features/leaves/schemas/leave-schemas";
import type { LeaveBalanceResponse } from "@/features/leaves/types/leave-types";
import { LEAVE_TYPE_LABELS } from "@/features/leaves/utils/leave-display";
import { getLeaveErrorMessage } from "@/features/leaves/utils/leave-errors";

export function AllocateBalanceDialog({
  employeeId,
  year = new Date().getFullYear(),
  existingBalance,
  trigger,
  onAllocated,
}: {
  employeeId: string;
  year?: number;
  existingBalance?: LeaveBalanceResponse;
  trigger?: React.ReactNode;
  onAllocated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const allocateMutation = useAllocateLeaveBalance();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AllocateBalanceFormValues>({
    resolver: zodResolver(allocateBalanceSchema),
    defaultValues: {
      leaveType: existingBalance ? (existingBalance.leaveType as "CL" | "SL" | "EL" | "CO") : "CL",
      year: existingBalance ? existingBalance.year : year,
      allocatedDays: existingBalance ? existingBalance.allocatedDays : 12,
    },
  });

  useEffect(() => {
    if (existingBalance) {
      reset({
        leaveType: existingBalance.leaveType as "CL" | "SL" | "EL" | "CO",
        year: existingBalance.year,
        allocatedDays: existingBalance.allocatedDays,
      });
    }
  }, [existingBalance, reset]);

  const committedDays = existingBalance
    ? existingBalance.usedDays + existingBalance.pendingDays
    : 0;

  const onSubmit = async (values: AllocateBalanceFormValues) => {
    try {
      await allocateMutation.mutateAsync({
        employeeId,
        request: values,
      });
      setOpen(false);
      onAllocated?.();
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="outline" size="sm">
            <Coins className="mr-1.5 size-3.5" />
            {existingBalance ? "Adjust balance" : "Allocate balance"}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogTitle>
          {existingBalance ? "Adjust leave balance" : "Allocate leave balance"}
        </AlertDialogTitle>
        <AlertDialogDescription>
          Set the annual leave quota for this employee. Allocations cannot be
          reduced below committed (used + pending) leave days.
        </AlertDialogDescription>

        {existingBalance && (
          <div className="mt-3 rounded-lg border bg-muted/40 p-3 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current allocation:</span>
              <span className="font-semibold">{existingBalance.allocatedDays} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Used days:</span>
              <span className="font-semibold">{existingBalance.usedDays} days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pending days:</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {existingBalance.pendingDays} days
              </span>
            </div>
            <div className="flex justify-between border-t pt-1">
              <span className="text-muted-foreground">Minimum allowed:</span>
              <span className="font-semibold text-foreground">
                {committedDays} days
              </span>
            </div>
          </div>
        )}

        {allocateMutation.isError && (
          <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">Unable to allocate balance</p>
              <p className="text-xs">
                {getLeaveErrorMessage(allocateMutation.error)}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="allocLeaveType">Leave type</Label>
            <Select
              id="allocLeaveType"
              {...register("leaveType")}
              disabled={Boolean(existingBalance)}
              aria-invalid={Boolean(errors.leaveType)}
            >
              <option value="CL">{LEAVE_TYPE_LABELS.CL} (CL)</option>
              <option value="SL">{LEAVE_TYPE_LABELS.SL} (SL)</option>
              <option value="EL">{LEAVE_TYPE_LABELS.EL} (EL)</option>
              <option value="CO">{LEAVE_TYPE_LABELS.CO} (CO)</option>
            </Select>
            {errors.leaveType && (
              <p className="text-xs text-destructive">
                {errors.leaveType.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="allocYear">Year</Label>
              <Input
                id="allocYear"
                type="number"
                {...register("year", { valueAsNumber: true })}
                disabled={Boolean(existingBalance)}
                aria-invalid={Boolean(errors.year)}
              />
              {errors.year && (
                <p className="text-xs text-destructive">
                  {errors.year.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="allocatedDays">Allocated days</Label>
              <Input
                id="allocatedDays"
                type="number"
                step="0.5"
                min={committedDays}
                {...register("allocatedDays", { valueAsNumber: true })}
                aria-invalid={Boolean(errors.allocatedDays)}
              />
              {errors.allocatedDays && (
                <p className="text-xs text-destructive">
                  {errors.allocatedDays.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <AlertDialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={allocateMutation.isPending}
              >
                Cancel
              </Button>
            </AlertDialogClose>
            <Button type="submit" disabled={allocateMutation.isPending}>
              {allocateMutation.isPending && (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              )}
              Save allocation
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

