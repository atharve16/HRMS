"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  CheckCircle2,
  Coins,
  LoaderCircle,
  XCircle,
} from "lucide-react";
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
import { Select } from "@/components/ui/select";
import { useGeneratePayroll } from "@/features/payroll/hooks/use-payroll";
import {
  generatePayrollSchema,
  type GeneratePayrollFormValues,
} from "@/features/payroll/schemas/payroll-schemas";
import type { PayrollGenerationSummary } from "@/features/payroll/types/payroll-types";
import { MONTH_OPTIONS } from "@/features/payroll/utils/payroll-display";
import { getPayrollErrorMessage } from "@/features/payroll/utils/payroll-errors";

export function GeneratePayrollDialog({
  defaultMonth,
  defaultYear,
  trigger,
  onSuccess,
}: {
  defaultMonth?: number;
  defaultYear?: number;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<PayrollGenerationSummary | null>(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const generateMutation = useGeneratePayroll();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<GeneratePayrollFormValues>({
    resolver: zodResolver(generatePayrollSchema),
    defaultValues: {
      month: defaultMonth ?? currentMonth,
      year: defaultYear ?? currentYear,
    },
  });

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      reset({
        month: defaultMonth ?? currentMonth,
        year: defaultYear ?? currentYear,
      });
      setSummary(null);
    }
  };

  const onSubmit = (values: GeneratePayrollFormValues) => {
    generateMutation.mutate(values, {
      onSuccess: (data) => {
        setSummary(data);
        if (onSuccess) {
          onSuccess();
        }
      },
    });
  };

  return (
    <AlertDialog onOpenChange={handleOpenChange} open={open}>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button type="button">
            <Coins aria-hidden="true" className="mr-2 size-4" />
            Generate Payroll
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogTitle>Generate Monthly Payroll</AlertDialogTitle>
        <AlertDialogDescription>
          Calculate attendance, approved leaves, and base salaries to generate draft payrolls for active employees.
        </AlertDialogDescription>

        {generateMutation.isError && (
          <div
            aria-live="polite"
            className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">Failed to generate payroll</p>
              <p className="mt-0.5">{getPayrollErrorMessage(generateMutation.error)}</p>
            </div>
          </div>
        )}

        {summary ? (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-900 dark:bg-emerald-950/20">
                <span className="flex items-center justify-center gap-1 text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                  <CheckCircle2 className="size-3.5" /> Generated
                </span>
                <p className="mt-1 text-2xl font-bold text-emerald-900 dark:text-emerald-300">
                  {summary.generated.length}
                </p>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900 dark:bg-amber-950/20">
                <span className="flex items-center justify-center gap-1 text-xs font-semibold text-amber-800 dark:text-amber-400">
                  <AlertCircle className="size-3.5" /> Skipped
                </span>
                <p className="mt-1 text-2xl font-bold text-amber-900 dark:text-amber-300">
                  {summary.skipped.length}
                </p>
              </div>

              <div className="rounded-lg border border-rose-200 bg-rose-50/60 p-3 dark:border-rose-900 dark:bg-rose-950/20">
                <span className="flex items-center justify-center gap-1 text-xs font-semibold text-rose-800 dark:text-rose-400">
                  <XCircle className="size-3.5" /> Failed
                </span>
                <p className="mt-1 text-2xl font-bold text-rose-900 dark:text-rose-300">
                  {summary.failed.length}
                </p>
              </div>
            </div>

            {summary.skipped.length > 0 && (
              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-xs font-medium text-foreground mb-2">Skipped records:</p>
                <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-muted-foreground">
                  {summary.skipped.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.employeeCode || item.employeeId}:</span>
                      <span className="font-mono text-xs">{item.reason || "Skipped"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.failed.length > 0 && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-3">
                <p className="text-xs font-medium text-destructive mb-2">Failed records:</p>
                <ul className="max-h-32 space-y-1 overflow-y-auto text-xs text-destructive">
                  {summary.failed.map((item, index) => (
                    <li key={index} className="flex justify-between">
                      <span>{item.employeeCode || item.employeeId}:</span>
                      <span className="font-mono text-xs">{item.reason || "Failed"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <Button onClick={() => handleOpenChange(false)} type="button">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="payroll-month">Month</Label>
                <Select id="payroll-month" {...register("month", { valueAsNumber: true })}>
                  {MONTH_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </Select>
                {errors.month && (
                  <p className="text-xs text-destructive">{errors.month.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="payroll-year">Year</Label>
                <Input
                  id="payroll-year"
                  max={2100}
                  min={2000}
                  type="number"
                  {...register("year", { valueAsNumber: true })}
                />
                {errors.year && (
                  <p className="text-xs text-destructive">{errors.year.message}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <AlertDialogClose asChild>
                <Button disabled={generateMutation.isPending} type="button" variant="outline">
                  Cancel
                </Button>
              </AlertDialogClose>
              <Button disabled={generateMutation.isPending} type="submit">
                {generateMutation.isPending ? (
                  <>
                    <LoaderCircle aria-hidden="true" className="mr-2 size-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Run Calculation"
                )}
              </Button>
            </div>
          </form>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
