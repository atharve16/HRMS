"use client";

import { AlertCircle, BriefcasePlus, LoaderCircle } from "lucide-react";
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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useOfficeLocationOptions } from "@/features/office-locations/hooks/use-office-location-references";
import { useShiftOptions } from "@/features/shifts/hooks/use-shift-references";
import { useCreateWorkAssignment } from "@/features/work-assignments/hooks/use-create-work-assignment";
import {
  createAssignmentSchema,
  type CreateAssignmentFormValues,
} from "@/features/work-assignments/schemas/work-assignment-schemas";
import {
  applyWorkAssignmentFieldErrors,
  getWorkAssignmentErrorMessage,
} from "@/features/work-assignments/utils/work-assignment-errors";

export function CreateWorkAssignmentDialog({
  employeeId,
  employeeName,
  trigger,
  onCreated,
}: {
  employeeId: string;
  employeeName?: string;
  trigger?: React.ReactNode;
  onCreated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const shiftsQuery = useShiftOptions();
  const officesQuery = useOfficeLocationOptions();
  const createMutation = useCreateWorkAssignment(employeeId);

  const todayStr = new Date().toISOString().slice(0, 10);

  const form = useForm<CreateAssignmentFormValues>({
    resolver: zodResolver(createAssignmentSchema),
    defaultValues: {
      shiftId: "",
      officeLocationId: "",
      effectiveFrom: todayStr,
      effectiveTo: "",
      reason: "",
    },
  });

  const activeShifts = shiftsQuery.data?.content.filter(
    (s) => s.status === "ACTIVE",
  ) ?? [];
  const activeOffices = officesQuery.data?.content.filter(
    (o) => o.status === "ACTIVE",
  ) ?? [];

  async function onSubmit(data: CreateAssignmentFormValues) {
    setGeneralError(null);
    createMutation.reset();

    try {
      await createMutation.mutateAsync({
        shiftId: data.shiftId,
        officeLocationId: data.officeLocationId,
        effectiveFrom: data.effectiveFrom,
        effectiveTo: data.effectiveTo?.trim() ? data.effectiveTo.trim() : null,
        reason: data.reason?.trim() ? data.reason.trim() : null,
      });

      setOpen(false);
      form.reset({
        shiftId: "",
        officeLocationId: "",
        effectiveFrom: todayStr,
        effectiveTo: "",
        reason: "",
      });
      onCreated?.();
    } catch (err) {
      const fieldApplied = applyWorkAssignmentFieldErrors(err, form.setError);
      if (!fieldApplied) {
        setGeneralError(getWorkAssignmentErrorMessage(err));
      }
    }
  }

  return (
    <AlertDialog
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setGeneralError(null);
          createMutation.reset();
          form.reset({
            shiftId: "",
            officeLocationId: "",
            effectiveFrom: todayStr,
            effectiveTo: "",
            reason: "",
          });
        }
      }}
      open={open}
    >
      <AlertDialogTrigger asChild>
        {trigger ?? (
          <Button size="sm" type="button">
            <BriefcasePlus aria-hidden="true" className="size-4" />
            Assign shift & location
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogTitle>Assign work shift & office location</AlertDialogTitle>
        <AlertDialogDescription>
          {employeeName
            ? `Configure the working schedule and primary office location for ${employeeName}.`
            : "Configure the working schedule and primary office location for this employee."}
        </AlertDialogDescription>

        {generalError && (
          <div
            className="mt-3 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive-soft p-3 text-xs text-destructive"
            role="alert"
          >
            <AlertCircle aria-hidden="true" className="size-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Assignment conflict</p>
              <p className="mt-0.5">{generalError}</p>
            </div>
          </div>
        )}

        <form className="mt-4 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <Label htmlFor="shiftId">Work shift *</Label>
            <Select
              id="shiftId"
              {...form.register("shiftId")}
              aria-invalid={Boolean(form.formState.errors.shiftId)}
              className="mt-1.5"
              disabled={shiftsQuery.isLoading}
            >
              <option value="">
                {shiftsQuery.isLoading ? "Loading shifts..." : "Select a shift"}
              </option>
              {activeShifts.map((shift) => (
                <option key={shift.id} value={shift.id}>
                  {shift.name} ({shift.shiftCode}) — {shift.startTime.slice(0, 5)} to {shift.endTime.slice(0, 5)}
                </option>
              ))}
            </Select>
            {form.formState.errors.shiftId && (
              <p className="mt-1 text-xs text-destructive" role="alert">
                {form.formState.errors.shiftId.message}
              </p>
            )}
            {activeShifts.length === 0 && !shiftsQuery.isLoading && (
              <p className="mt-1 text-xs text-muted-foreground">
                No active shifts found. Create and activate a shift first.
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="officeLocationId">Office location *</Label>
            <Select
              id="officeLocationId"
              {...form.register("officeLocationId")}
              aria-invalid={Boolean(form.formState.errors.officeLocationId)}
              className="mt-1.5"
              disabled={officesQuery.isLoading}
            >
              <option value="">
                {officesQuery.isLoading ? "Loading office locations..." : "Select an office location"}
              </option>
              {activeOffices.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.name} ({loc.locationCode})
                </option>
              ))}
            </Select>
            {form.formState.errors.officeLocationId && (
              <p className="mt-1 text-xs text-destructive" role="alert">
                {form.formState.errors.officeLocationId.message}
              </p>
            )}
            {activeOffices.length === 0 && !officesQuery.isLoading && (
              <p className="mt-1 text-xs text-muted-foreground">
                No active office locations found. Create and activate an office location first.
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="effectiveFrom">Effective start date *</Label>
              <Input
                id="effectiveFrom"
                type="date"
                {...form.register("effectiveFrom")}
                aria-invalid={Boolean(form.formState.errors.effectiveFrom)}
                className="mt-1.5"
              />
              {form.formState.errors.effectiveFrom && (
                <p className="mt-1 text-xs text-destructive" role="alert">
                  {form.formState.errors.effectiveFrom.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="effectiveTo">Effective end date (optional)</Label>
              <Input
                id="effectiveTo"
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
            </div>
          </div>

          <div>
            <Label htmlFor="create-reason">Reason (optional)</Label>
            <Textarea
              id="create-reason"
              maxLength={500}
              placeholder="e.g. Standard schedule for onboarding"
              rows={2}
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

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <AlertDialogClose asChild>
              <Button disabled={createMutation.isPending} type="button" variant="outline">
                Cancel
              </Button>
            </AlertDialogClose>
            <Button
              disabled={
                createMutation.isPending ||
                activeShifts.length === 0 ||
                activeOffices.length === 0
              }
              type="submit"
            >
              {createMutation.isPending && (
                <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
              )}
              {createMutation.isPending ? "Assigning..." : "Save assignment"}
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

