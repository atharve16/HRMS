"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, IndianRupee, LoaderCircle } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpsertEmployeeSalary } from "@/features/payroll/hooks/use-payroll";
import {
  upsertSalarySchema,
  type UpsertSalaryFormValues,
} from "@/features/payroll/schemas/payroll-schemas";
import type { SalaryStructureResponse } from "@/features/payroll/types/payroll-types";
import { formatCurrency } from "@/features/payroll/utils/payroll-display";
import { getPayrollErrorMessage } from "@/features/payroll/utils/payroll-errors";

export function UpsertSalaryDialog({
  employeeId,
  employeeName,
  currentSalary,
  trigger,
  onSuccess,
}: {
  employeeId: string;
  employeeName?: string;
  currentSalary?: SalaryStructureResponse | null;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const upsertMutation = useUpsertEmployeeSalary();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpsertSalaryFormValues>({
    resolver: zodResolver(upsertSalarySchema),
    defaultValues: {
      monthlyFixedSalary: currentSalary?.monthlyFixedSalary ?? 50000,
      effectiveFrom: currentSalary?.effectiveFrom ?? today,
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset({
        monthlyFixedSalary: currentSalary?.monthlyFixedSalary ?? 50000,
        effectiveFrom: currentSalary?.effectiveFrom ?? today,
      });
    }
  };

  const onSubmit = (values: UpsertSalaryFormValues) => {
    upsertMutation.mutate(
      {
        employeeId,
        payload: {
          monthlyFixedSalary: Number(values.monthlyFixedSalary),
          effectiveFrom: values.effectiveFrom,
        },
      },
      {
        onSuccess: () => {
          setOpen(false);
          if (onSuccess) onSuccess();
        },
      },
    );
  };

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={open}>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" type="button">
            <IndianRupee className="mr-1.5 size-4" />
            {currentSalary ? "Update Salary" : "Set Salary"}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogTitle>
          {currentSalary ? "Update Salary Structure" : "Set Initial Salary"}
        </AlertDialogTitle>
        <AlertDialogDescription>
          Configure monthly fixed base salary for {employeeName ?? "employee"}.
        </AlertDialogDescription>

        {currentSalary && (
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs space-y-1">
            <p className="font-semibold text-foreground">Current Active Structure:</p>
            <p className="text-muted-foreground">
              Salary: <span className="font-mono font-medium text-foreground">{formatCurrency(currentSalary.monthlyFixedSalary)}</span>
            </p>
            <p className="text-muted-foreground">
              Effective Since: <span className="font-mono text-foreground">{currentSalary.effectiveFrom}</span>
            </p>
          </div>
        )}

        {upsertMutation.isError && (
          <div
            aria-live="polite"
            className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">Failed to update salary</p>
              <p className="mt-0.5">{getPayrollErrorMessage(upsertMutation.error)}</p>
            </div>
          </div>
        )}

        <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <Label htmlFor="salary-amount">Monthly Fixed Salary (₹ INR)</Label>
            <Input
              id="salary-amount"
              min={1}
              step="0.01"
              type="number"
              {...register("monthlyFixedSalary", { valueAsNumber: true })}
            />
            {errors.monthlyFixedSalary && (
              <p className="text-xs text-destructive">{errors.monthlyFixedSalary.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="salary-effective-date">Effective From</Label>
            <Input
              id="salary-effective-date"
              type="date"
              {...register("effectiveFrom")}
            />
            {errors.effectiveFrom && (
              <p className="text-xs text-destructive">{errors.effectiveFrom.message}</p>
            )}
            <p className="text-[11px] text-muted-foreground">
              Cannot precede the employee&apos;s joining date or existing salary start date.
            </p>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <AlertDialogClose asChild>
              <Button disabled={upsertMutation.isPending} type="button" variant="outline">
                Cancel
              </Button>
            </AlertDialogClose>
            <Button disabled={upsertMutation.isPending} type="submit">
              {upsertMutation.isPending ? (
                <>
                  <LoaderCircle aria-hidden="true" className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Structure"
              )}
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
