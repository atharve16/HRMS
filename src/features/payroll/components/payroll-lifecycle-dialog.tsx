"use client";

import {
  AlertCircle,
  CheckCheck,
  CreditCard,
  Eye,
  LoaderCircle,
} from "lucide-react";
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
import {
  useFinalizePayroll,
  usePayPayroll,
  useReviewPayroll,
} from "@/features/payroll/hooks/use-payroll";
import type { PayrollResponse } from "@/features/payroll/types/payroll-types";
import {
  formatCurrency,
  formatPayrollPeriod,
} from "@/features/payroll/utils/payroll-display";
import { getPayrollErrorMessage } from "@/features/payroll/utils/payroll-errors";

type LifecycleAction = "review" | "finalize" | "pay";

export function PayrollLifecycleDialog({
  payroll,
  action,
  trigger,
  onSuccess,
}: {
  payroll: PayrollResponse;
  action: LifecycleAction;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const reviewMutation = useReviewPayroll();
  const finalizeMutation = useFinalizePayroll();
  const payMutation = usePayPayroll();

  const isPending =
    reviewMutation.isPending ||
    finalizeMutation.isPending ||
    payMutation.isPending;

  const currentError =
    reviewMutation.error || finalizeMutation.error || payMutation.error;

  const handleConfirm = () => {
    const opts = {
      onSuccess: () => {
        setOpen(false);
        if (onSuccess) onSuccess();
      },
    };

    if (action === "review") {
      reviewMutation.mutate(payroll.id, opts);
    } else if (action === "finalize") {
      finalizeMutation.mutate(payroll.id, opts);
    } else if (action === "pay") {
      payMutation.mutate(payroll.id, opts);
    }
  };

  const getActionConfig = () => {
    switch (action) {
      case "review":
        return {
          title: "Submit Payroll for Review",
          description: `Mark the ${formatPayrollPeriod(payroll.payrollMonth, payroll.payrollYear)} payroll for ${payroll.employeeNameSnapshot} (${payroll.employeeCodeSnapshot}) as Reviewed.`,
          warning: null,
          confirmText: "Mark as Reviewed",
          buttonVariant: "outline" as const,
          defaultTriggerText: "Review",
          icon: Eye,
        };
      case "finalize":
        return {
          title: "Finalize Payroll",
          description: `Finalize the ${formatPayrollPeriod(payroll.payrollMonth, payroll.payrollYear)} payroll for ${payroll.employeeNameSnapshot} (${payroll.employeeCodeSnapshot}) with net payout of ${formatCurrency(payroll.netSalary)}.`,
          warning:
            "Warning: Finalizing locks this payroll record permanently. It will become immutable and visible to the employee on their portal. Adjustments can no longer be made.",
          confirmText: "Confirm & Finalize",
          buttonVariant: "default" as const,
          defaultTriggerText: "Finalize",
          icon: CheckCheck,
        };
      case "pay":
        return {
          title: "Mark Payroll as Paid",
          description: `Record that salary payment of ${formatCurrency(payroll.netSalary)} has been disbursed to ${payroll.employeeNameSnapshot} (${payroll.employeeCodeSnapshot}).`,
          warning: null,
          confirmText: "Confirm Payment",
          buttonVariant: "default" as const,
          defaultTriggerText: "Mark as Paid",
          icon: CreditCard,
        };
    }
  };

  const config = getActionConfig();
  const Icon = config.icon;

  return (
    <AlertDialog onOpenChange={setOpen} open={open}>
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" type="button" variant={config.buttonVariant}>
            <Icon aria-hidden="true" className="mr-1.5 size-4" />
            {config.defaultTriggerText}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogTitle>{config.title}</AlertDialogTitle>
        <AlertDialogDescription>{config.description}</AlertDialogDescription>

        {config.warning && (
          <div className="mt-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            {config.warning}
          </div>
        )}

        {currentError && (
          <div
            aria-live="polite"
            className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">Action failed</p>
              <p className="mt-0.5">{getPayrollErrorMessage(currentError)}</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <AlertDialogClose asChild>
            <Button disabled={isPending} type="button" variant="outline">
              Cancel
            </Button>
          </AlertDialogClose>
          <Button disabled={isPending} onClick={handleConfirm} type="button">
            {isPending ? (
              <>
                <LoaderCircle aria-hidden="true" className="mr-2 size-4 animate-spin" />
                Processing...
              </>
            ) : (
              config.confirmText
            )}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
