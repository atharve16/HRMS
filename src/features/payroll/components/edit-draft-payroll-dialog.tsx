"use client";

import { AlertCircle, LoaderCircle, Plus, Trash2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useUpdateDraftPayroll } from "@/features/payroll/hooks/use-payroll";
import type {
  PayrollAdjustmentInput,
  PayrollAdjustmentType,
  PayrollResponse,
} from "@/features/payroll/types/payroll-types";
import {
  formatCurrency,
  formatPayrollPeriod,
} from "@/features/payroll/utils/payroll-display";
import { getPayrollErrorMessage } from "@/features/payroll/utils/payroll-errors";

export function EditDraftPayrollDialog({
  payroll,
  trigger,
  onSuccess,
}: {
  payroll: PayrollResponse;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);

  const [earnings, setEarnings] = useState<PayrollAdjustmentInput[]>(
    payroll.earnings.map((e) => ({
      type: e.type,
      description: e.description,
      amount: e.amount,
    })),
  );

  const [deductions, setDeductions] = useState<PayrollAdjustmentInput[]>(
    payroll.deductions.map((d) => ({
      type: d.type,
      description: d.description,
      amount: d.amount,
    })),
  );

  const [formError, setFormError] = useState<string | null>(null);

  const updateMutation = useUpdateDraftPayroll();

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setEarnings(
        payroll.earnings.map((e) => ({
          type: e.type,
          description: e.description,
          amount: e.amount,
        })),
      );
      setDeductions(
        payroll.deductions.map((d) => ({
          type: d.type,
          description: d.description,
          amount: d.amount,
        })),
      );
      setFormError(null);
    }
  };

  // Calculate live preview
  const totalEarnings = earnings.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
  const totalDeductions = deductions.reduce(
    (acc, curr) => acc + (Number(curr.amount) || 0),
    0,
  );
  const basePayable = payroll.monthlyFixedSalarySnapshot - payroll.salaryDeduction;
  const projectedNet = basePayable + totalEarnings - totalDeductions;

  const handleAddEarning = () => {
    setEarnings((prev) => [
      ...prev,
      { type: "BONUS", description: "", amount: 0 },
    ]);
  };

  const handleRemoveEarning = (index: number) => {
    setEarnings((prev) => prev.filter((_, i) => i !== index));
  };

  const handleEarningChange = (
    index: number,
    field: keyof PayrollAdjustmentInput,
    value: string | number,
  ) => {
    setEarnings((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleAddDeduction = () => {
    setDeductions((prev) => [
      ...prev,
      { type: "OTHER_DEDUCTION", description: "", amount: 0 },
    ]);
  };

  const handleRemoveDeduction = (index: number) => {
    setDeductions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeductionChange = (
    index: number,
    field: keyof PayrollAdjustmentInput,
    value: string | number,
  ) => {
    setDeductions((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate entries
    for (const earn of earnings) {
      if (!earn.description.trim()) {
        setFormError("All earning adjustments must have a description.");
        return;
      }
      if (earn.amount <= 0) {
        setFormError("All earning amounts must be greater than zero.");
        return;
      }
    }

    for (const ded of deductions) {
      if (!ded.description.trim()) {
        setFormError("All deduction adjustments must have a description.");
        return;
      }
      if (ded.amount <= 0) {
        setFormError("All deduction amounts must be greater than zero.");
        return;
      }
    }

    if (projectedNet < 0) {
      setFormError("Total deductions exceed total pay. Net salary cannot be negative.");
      return;
    }

    updateMutation.mutate(
      {
        payrollId: payroll.id,
        payload: {
          earnings,
          deductions,
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
          <Button size="sm" type="button" variant="outline">
            Edit Adjustments
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogTitle>Edit Payroll Adjustments</AlertDialogTitle>
        <AlertDialogDescription>
          Modify bonuses, overtime, or other adjustments for {payroll.employeeNameSnapshot} ({payroll.employeeCodeSnapshot}) —{" "}
          {formatPayrollPeriod(payroll.payrollMonth, payroll.payrollYear)}.
        </AlertDialogDescription>

        {(formError || updateMutation.isError) && (
          <div
            aria-live="polite"
            className="mt-4 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-medium">Adjustment Error</p>
              <p className="mt-0.5">
                {formError || getPayrollErrorMessage(updateMutation.error)}
              </p>
            </div>
          </div>
        )}

        <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
          {/* Earnings Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Additional Earnings (Bonuses, OT)</Label>
              <Button onClick={handleAddEarning} size="sm" type="button" variant="outline">
                <Plus className="mr-1 size-3.5" /> Add Earning
              </Button>
            </div>

            {earnings.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No additional earnings added.</p>
            ) : (
              <div className="space-y-2">
                {earnings.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      className="w-40"
                      onChange={(e) =>
                        handleEarningChange(
                          index,
                          "type",
                          e.target.value as PayrollAdjustmentType,
                        )
                      }
                      value={item.type}
                    >
                      <option value="BONUS">Bonus</option>
                      <option value="OVERTIME_PAY">Overtime Pay</option>
                      <option value="OTHER_EARNING">Other Earning</option>
                    </Select>
                    <Input
                      className="flex-1"
                      onChange={(e) =>
                        handleEarningChange(index, "description", e.target.value)
                      }
                      placeholder="Description"
                      value={item.description}
                    />
                    <Input
                      className="w-28 text-right font-mono"
                      min={0}
                      onChange={(e) =>
                        handleEarningChange(index, "amount", parseFloat(e.target.value) || 0)
                      }
                      placeholder="Amount"
                      step="0.01"
                      type="number"
                      value={item.amount || ""}
                    />
                    <Button
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => handleRemoveEarning(index)}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Deductions Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Other Deductions</Label>
              <Button onClick={handleAddDeduction} size="sm" type="button" variant="outline">
                <Plus className="mr-1 size-3.5" /> Add Deduction
              </Button>
            </div>

            {deductions.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No other deductions added.</p>
            ) : (
              <div className="space-y-2">
                {deductions.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Select
                      className="w-40"
                      onChange={(e) =>
                        handleDeductionChange(
                          index,
                          "type",
                          e.target.value as PayrollAdjustmentType,
                        )
                      }
                      value={item.type}
                    >
                      <option value="OTHER_DEDUCTION">Other Deduction</option>
                    </Select>
                    <Input
                      className="flex-1"
                      onChange={(e) =>
                        handleDeductionChange(index, "description", e.target.value)
                      }
                      placeholder="Description"
                      value={item.description}
                    />
                    <Input
                      className="w-28 text-right font-mono"
                      min={0}
                      onChange={(e) =>
                        handleDeductionChange(index, "amount", parseFloat(e.target.value) || 0)
                      }
                      placeholder="Amount"
                      step="0.01"
                      type="number"
                      value={item.amount || ""}
                    />
                    <Button
                      className="text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => handleRemoveDeduction(index)}
                      size="sm"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Summary / Calculation Box */}
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm space-y-1.5">
            <div className="flex justify-between text-muted-foreground">
              <span>Base Payable (Fixed - Attendance Loss):</span>
              <span className="font-mono">{formatCurrency(basePayable)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Additional Earnings:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400">
                +{formatCurrency(totalEarnings)}
              </span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Other Deductions:</span>
              <span className="font-mono text-rose-600 dark:text-rose-400">
                -{formatCurrency(totalDeductions)}
              </span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between font-semibold text-foreground">
              <span>Projected Net Salary:</span>
              <span className={projectedNet < 0 ? "text-destructive font-mono" : "font-mono"}>
                {formatCurrency(projectedNet)}
              </span>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <AlertDialogClose asChild>
              <Button disabled={updateMutation.isPending} type="button" variant="outline">
                Cancel
              </Button>
            </AlertDialogClose>
            <Button disabled={updateMutation.isPending || projectedNet < 0} type="submit">
              {updateMutation.isPending ? (
                <>
                  <LoaderCircle aria-hidden="true" className="mr-2 size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Adjustments"
              )}
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
