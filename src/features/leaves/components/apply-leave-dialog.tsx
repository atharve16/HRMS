"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CalendarPlus, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";

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
import { Textarea } from "@/components/ui/textarea";
import { useApplyLeave } from "@/features/leaves/hooks/use-leaves";
import {
  applyLeaveSchema,
  type ApplyLeaveFormValues,
} from "@/features/leaves/schemas/leave-schemas";
import type {
  LeaveBalanceResponse,
  LeaveType,
} from "@/features/leaves/types/leave-types";
import {
  isPaidLeave,
  LEAVE_TYPE_LABELS,
} from "@/features/leaves/utils/leave-display";
import { getLeaveErrorMessage } from "@/features/leaves/utils/leave-errors";

export function ApplyLeaveDialog({
  balances = [],
  trigger,
}: {
  balances?: LeaveBalanceResponse[];
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  const applyMutation = useApplyLeave();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ApplyLeaveFormValues>({
    resolver: zodResolver(applyLeaveSchema),
    defaultValues: {
      leaveType: "CL",
      startDate: today,
      endDate: today,
      reason: "",
    },
  });

  const selectedType = (useWatch({ control, name: "leaveType" }) || "CL") as LeaveType;
  const startDate = useWatch({ control, name: "startDate" }) || today;
  const selectedBalance = balances.find((b) => b.leaveType === selectedType);
  const isPaid = isPaidLeave(selectedType);

  const onSubmit = async (values: ApplyLeaveFormValues) => {
    try {
      await applyMutation.mutateAsync(values);
      reset();
      setOpen(false);
    } catch {
      // Handled by applyMutation.error display
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button type="button">
            <CalendarPlus className="mr-2 size-4" />
            Apply for leave
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogTitle>Apply for leave</AlertDialogTitle>
        <AlertDialogDescription>
          Submit a new leave application. Leave days will be calculated based on
          your work schedule and company holidays.
        </AlertDialogDescription>

        {applyMutation.isError && (
          <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">Unable to submit leave request</p>
              <p className="text-xs">
                {getLeaveErrorMessage(applyMutation.error)}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="leaveType">Leave type</Label>
            <Select
              id="leaveType"
              {...register("leaveType")}
              aria-invalid={Boolean(errors.leaveType)}
            >
              <option value="CL">{LEAVE_TYPE_LABELS.CL} (CL)</option>
              <option value="SL">{LEAVE_TYPE_LABELS.SL} (SL)</option>
              <option value="EL">{LEAVE_TYPE_LABELS.EL} (EL)</option>
              <option value="CO">{LEAVE_TYPE_LABELS.CO} (CO)</option>
              <option value="LWP">{LEAVE_TYPE_LABELS.LWP} (LWP - Unpaid)</option>
            </Select>
            {errors.leaveType && (
              <p className="text-xs text-destructive">
                {errors.leaveType.message}
              </p>
            )}

            <div className="mt-1 text-xs text-muted-foreground">
              {isPaid ? (
                selectedBalance ? (
                  <span>
                    Available balance:{" "}
                    <strong className="text-foreground">
                      {selectedBalance.availableDays} days
                    </strong>{" "}
                    (Used: {selectedBalance.usedDays}, Pending:{" "}
                    {selectedBalance.pendingDays})
                  </span>
                ) : (
                  <span>No balance record found for this year yet.</span>
                )
              ) : (
                <span>
                  Leave Without Pay does not deduct from your paid leave balance.
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                type="date"
                min={today}
                {...register("startDate")}
                aria-invalid={Boolean(errors.startDate)}
              />
              {errors.startDate && (
                <p className="text-xs text-destructive">
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endDate">End date</Label>
              <Input
                id="endDate"
                type="date"
                min={startDate || today}
                {...register("endDate")}
                aria-invalid={Boolean(errors.endDate)}
              />
              {errors.endDate && (
                <p className="text-xs text-destructive">
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason for leave</Label>
            <Textarea
              id="reason"
              placeholder="State the reason for your leave application..."
              rows={3}
              {...register("reason")}
              aria-invalid={Boolean(errors.reason)}
            />
            {errors.reason && (
              <p className="text-xs text-destructive">
                {errors.reason.message}
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <AlertDialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={applyMutation.isPending}
              >
                Cancel
              </Button>
            </AlertDialogClose>
            <Button type="submit" disabled={applyMutation.isPending}>
              {applyMutation.isPending && (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              )}
              Submit request
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

