"use client";

import { Ban, LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Textarea } from "@/components/ui/textarea";
import { useEndWorkAssignment } from "@/features/work-assignments/hooks/use-end-work-assignment";
import {
  endAssignmentSchema,
  type EndAssignmentFormValues,
} from "@/features/work-assignments/schemas/work-assignment-schemas";
import type { WorkAssignment } from "@/features/work-assignments/types/work-assignment-types";
import { formatAssignmentDate } from "@/features/work-assignments/utils/work-assignment-display";
import { getWorkAssignmentErrorMessage } from "@/features/work-assignments/utils/work-assignment-errors";

export function WorkAssignmentEndDialog({
  assignment,
  shiftName,
  officeName,
  trigger,
  onEnded,
}: {
  assignment: WorkAssignment;
  shiftName?: string;
  officeName?: string;
  trigger?: React.ReactNode;
  onEnded?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const endMutation = useEndWorkAssignment(assignment.id);

  const todayStr = new Date().toISOString().slice(0, 10);
  const defaultEffectiveTo =
    todayStr >= assignment.effectiveFrom ? todayStr : assignment.effectiveFrom;

  const form = useForm<EndAssignmentFormValues>({
    resolver: zodResolver(endAssignmentSchema),
    defaultValues: {
      effectiveTo: defaultEffectiveTo,
      reason: "",
    },
  });

  async function onSubmit(data: EndAssignmentFormValues) {
    if (data.effectiveTo < assignment.effectiveFrom) {
      form.setError("effectiveTo", {
        type: "manual",
        message: `Effective end date cannot be earlier than start date (${formatAssignmentDate(assignment.effectiveFrom)}).`,
      });
      return;
    }

    try {
      await endMutation.mutateAsync({
        effectiveTo: data.effectiveTo,
        reason: data.reason?.trim() ? data.reason.trim() : undefined,
      });
      setOpen(false);
      form.reset({
        effectiveTo: defaultEffectiveTo,
        reason: "",
      });
      onEnded?.();
    } catch {
      // Error message is displayed in dialog
    }
  }

  return (
    <AlertDialog
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          endMutation.reset();
          form.reset({
            effectiveTo: defaultEffectiveTo,
            reason: "",
          });
        }
      }}
      open={open}
    >
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" type="button" variant="outline">
            <Ban aria-hidden="true" className="size-4 text-destructive" />
            End assignment
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogTitle>End work assignment?</AlertDialogTitle>
        <AlertDialogDescription>
          Specify the last effective date for this assignment. After this date, the employee will no longer be assigned to this shift and office location.
        </AlertDialogDescription>

        <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground space-y-1">
          <div>
            <span className="font-semibold text-foreground">Shift: </span>
            {shiftName || assignment.shiftId}
          </div>
          <div>
            <span className="font-semibold text-foreground">Location: </span>
            {officeName || assignment.officeLocationId}
          </div>
          <div>
            <span className="font-semibold text-foreground">Started: </span>
            {formatAssignmentDate(assignment.effectiveFrom)}
          </div>
        </div>

        <form className="mt-4 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="effectiveTo">Effective end date *</Label>
            <Input
              id="effectiveTo"
              min={assignment.effectiveFrom}
              type="date"
              {...form.register("effectiveTo")}
              aria-invalid={Boolean(form.formState.errors.effectiveTo)}
              className="mt-1.5"
            />
            {form.formState.errors.effectiveTo && (
              <p className="mt-1 text-xs text-destructive" role="alert">
                {form.formState.errors.effectiveTo.message}
              </p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">
              Must be on or after {formatAssignmentDate(assignment.effectiveFrom)}.
            </p>
          </div>

          <div>
            <Label htmlFor="reason">Reason (optional)</Label>
            <Textarea
              id="reason"
              maxLength={500}
              placeholder="e.g. Employee transferred to another branch"
              rows={3}
              {...form.register("reason")}
              aria-invalid={Boolean(form.formState.errors.reason)}
              className="mt-1.5 resize-none"
            />
            {form.formState.errors.reason && (
              <p className="mt-1 text-xs text-destructive" role="alert">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>

          {endMutation.error && (
            <p className="text-xs text-destructive" role="alert">
              {getWorkAssignmentErrorMessage(endMutation.error)}
            </p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <AlertDialogClose asChild>
              <Button disabled={endMutation.isPending} type="button" variant="outline">
                Cancel
              </Button>
            </AlertDialogClose>
            <Button
              disabled={endMutation.isPending}
              type="submit"
              variant="destructive"
            >
              {endMutation.isPending && (
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              )}
              {endMutation.isPending ? "Ending..." : "End assignment"}
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

