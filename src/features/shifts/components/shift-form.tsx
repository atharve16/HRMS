"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertCircle,
  Clock,
  LoaderCircle,
  Moon,
  Save,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useForm, useWatch, type FieldError } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateShift } from "@/features/shifts/hooks/use-create-shift";
import { useUpdateShift } from "@/features/shifts/hooks/use-update-shift";
import {
  shiftFormSchema,
  type ShiftFormValues,
} from "@/features/shifts/schemas/shift-schemas";
import type { DayOfWeek, Shift } from "@/features/shifts/types/shift-types";
import {
  applyShiftFieldErrors,
  getShiftErrorMessage,
} from "@/features/shifts/utils/shift-errors";
import {
  emptyShiftFormValues,
  shiftToFormValues,
  toCreateShiftRequest,
  toUpdateShiftRequest,
} from "@/features/shifts/utils/shift-form-utils";
import {
  ALL_DAYS_OF_WEEK,
  DEFAULT_WORKING_DAYS,
  calculateShiftDurationMinutes,
  dayOfWeekLabels,
  formatMinutesDuration,
  isOvernightShift,
} from "@/features/shifts/utils/time-utils";
import { cn } from "@/lib/utils";

function FormField({
  children,
  error,
  hint,
  htmlFor,
  label,
}: {
  children: ReactNode;
  error?: FieldError;
  hint?: string;
  htmlFor: string;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" id={`${htmlFor}-error`} role="alert">
          {error.message}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground" id={`${htmlFor}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function ShiftForm({
  mode,
  shift,
}: {
  mode: "create" | "edit";
  shift?: Shift;
}) {
  const router = useRouter();
  const createMutation = useCreateShift();
  const updateMutation = useUpdateShift();
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftFormSchema),
    defaultValues: shift ? shiftToFormValues(shift) : emptyShiftFormValues,
  });

  const mutation = mode === "create" ? createMutation : updateMutation;

  // Watch start & end times using useWatch for live schedule calculations
  const watchedStartTime = useWatch({
    control: form.control,
    name: "startTime",
  });
  const watchedEndTime = useWatch({ control: form.control, name: "endTime" });
  const watchedWorkingDays =
    useWatch({ control: form.control, name: "workingDays" }) || [];

  const isOvernight = isOvernightShift(watchedStartTime, watchedEndTime);
  const durationMinutes = calculateShiftDurationMinutes(
    watchedStartTime,
    watchedEndTime,
  );

  function toggleDay(day: DayOfWeek) {
    const current = new Set(form.getValues("workingDays") || []);
    if (current.has(day)) {
      current.delete(day);
    } else {
      current.add(day);
    }
    form.setValue("workingDays", Array.from(current), {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  function setWeekdaysOnly() {
    form.setValue("workingDays", [...DEFAULT_WORKING_DAYS], {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  function setAllDays() {
    form.setValue("workingDays", [...ALL_DAYS_OF_WEEK], {
      shouldValidate: true,
      shouldDirty: true,
    });
  }

  async function submit(values: ShiftFormValues) {
    mutation.reset();
    setFormMessage(null);
    try {
      if (mode === "create") {
        const created = await createMutation.mutateAsync(
          toCreateShiftRequest(values),
        );
        router.push(`/admin/shifts/${created.id}?created=1`);
        return;
      }
      if (!shift) return;
      const request = toUpdateShiftRequest(values, shift);
      if (Object.keys(request).length === 0) {
        setFormMessage("No supported shift fields have changed.");
        return;
      }
      const updated = await updateMutation.mutateAsync({
        shiftId: shift.id,
        request,
      });
      router.push(`/admin/shifts/${updated.id}?updated=1`);
    } catch (error) {
      applyShiftFieldErrors(error, form.setError);
    }
  }

  return (
    <form className="space-y-6" noValidate onSubmit={form.handleSubmit(submit)}>
      <fieldset disabled={mutation.isPending}>
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Define the shift identifier and display name for organizational scheduling.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 sm:grid-cols-2">
            <FormField
              error={form.formState.errors.shiftCode}
              hint="2-20 letters, numbers, underscores, or hyphens. Saved in uppercase."
              htmlFor="shiftCode"
              label="Shift code"
            >
              <Input
                {...form.register("shiftCode")}
                aria-describedby={
                  form.formState.errors.shiftCode
                    ? "shiftCode-error"
                    : "shiftCode-hint"
                }
                aria-invalid={Boolean(form.formState.errors.shiftCode)}
                className="uppercase"
                id="shiftCode"
                placeholder="DAY-01"
              />
            </FormField>

            <FormField
              error={form.formState.errors.name}
              hint="Descriptive name (up to 120 characters)."
              htmlFor="name"
              label="Shift name"
            >
              <Input
                {...form.register("name")}
                aria-invalid={Boolean(form.formState.errors.name)}
                id="name"
                placeholder="Morning Regular Shift"
              />
            </FormField>

            <div className="sm:col-span-2">
              <FormField
                error={form.formState.errors.description}
                hint="Optional description or operational instructions (up to 1,000 characters)."
                htmlFor="description"
                label="Description"
              >
                <Textarea
                  {...form.register("description")}
                  aria-describedby={
                    form.formState.errors.description
                      ? "description-error"
                      : "description-hint"
                  }
                  aria-invalid={Boolean(form.formState.errors.description)}
                  id="description"
                  placeholder="Describe employee shift expectations or operational departments."
                />
              </FormField>
            </div>
          </CardContent>
        </Card>

        {/* Schedule & Working Days */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Schedule & Working Days</CardTitle>
            <CardDescription>
              Set start/end timings and assign applicable work days. Overnight shifts spanning past midnight are supported.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                error={form.formState.errors.startTime}
                hint="Daily scheduled shift start time."
                htmlFor="startTime"
                label="Start time"
              >
                <Input
                  {...form.register("startTime")}
                  aria-invalid={Boolean(form.formState.errors.startTime)}
                  id="startTime"
                  type="time"
                />
              </FormField>

              <FormField
                error={form.formState.errors.endTime}
                hint="Daily scheduled shift end time."
                htmlFor="endTime"
                label="End time"
              >
                <Input
                  {...form.register("endTime")}
                  aria-invalid={Boolean(form.formState.errors.endTime)}
                  id="endTime"
                  type="time"
                />
              </FormField>
            </div>

            {/* Overnight Shift Explanatory Alert */}
            {isOvernight ? (
              <div
                className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-300"
                role="status"
              >
                <Moon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-semibold">Overnight Shift Detected</p>
                  <p className="mt-0.5">
                    The scheduled end time is earlier than the start time. This shift starts on the shift date and ends the next calendar morning (+1 day). Gross scheduled duration: {formatMinutesDuration(durationMinutes)}.
                  </p>
                </div>
              </div>
            ) : durationMinutes > 0 ? (
              <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
                <Clock aria-hidden="true" className="size-4 text-primary" />
                <span>
                  Gross scheduled duration:{" "}
                  <strong className="text-foreground">
                    {formatMinutesDuration(durationMinutes)}
                  </strong>{" "}
                  ({durationMinutes} minutes)
                </span>
              </div>
            ) : null}

            {/* Working Days Selector */}
            <div className="space-y-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Label>Working Days</Label>
                  <p className="text-xs text-muted-foreground">
                    Select the days of the week when this shift is active.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={setWeekdaysOnly}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    Mon – Fri
                  </Button>
                  <Button
                    onClick={setAllDays}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    All 7 Days
                  </Button>
                </div>
              </div>

              <div
                aria-label="Working days selection"
                className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7"
                role="group"
              >
                {ALL_DAYS_OF_WEEK.map((day) => {
                  const selected = watchedWorkingDays.includes(day);
                  return (
                    <button
                      aria-pressed={selected}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-lg border p-3 text-center transition-colors",
                        selected
                          ? "border-primary bg-primary-soft text-primary font-semibold ring-1 ring-primary"
                          : "border-border bg-card text-muted-foreground hover:bg-muted/50",
                      )}
                      key={day}
                      onClick={() => toggleDay(day)}
                      type="button"
                    >
                      <span className="text-sm font-bold">
                        {dayOfWeekLabels[day].short}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {dayOfWeekLabels[day].full}
                      </span>
                    </button>
                  );
                })}
              </div>
              {form.formState.errors.workingDays && (
                <p className="text-xs text-destructive" role="alert">
                  {form.formState.errors.workingDays.message}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Grace Periods & Breaks */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Grace Periods & Break Policies</CardTitle>
            <CardDescription>
              Configure attendance tolerances and break allowances for time-tracking rules.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                error={form.formState.errors.gracePeriodMinutes}
                hint="Minutes after shift start before attendance is marked late (0-1440)."
                htmlFor="gracePeriodMinutes"
                label="Check-in grace period (minutes)"
              >
                <Input
                  {...form.register("gracePeriodMinutes")}
                  aria-invalid={Boolean(form.formState.errors.gracePeriodMinutes)}
                  id="gracePeriodMinutes"
                  min="0"
                  placeholder="15"
                  type="number"
                />
              </FormField>

              <FormField
                error={form.formState.errors.earlyDepartureGraceMinutes}
                hint="Minutes before shift end an employee may leave without penalty (0-1440)."
                htmlFor="earlyDepartureGraceMinutes"
                label="Early departure grace (minutes)"
              >
                <Input
                  {...form.register("earlyDepartureGraceMinutes")}
                  aria-invalid={Boolean(
                    form.formState.errors.earlyDepartureGraceMinutes,
                  )}
                  id="earlyDepartureGraceMinutes"
                  min="0"
                  placeholder="15"
                  type="number"
                />
              </FormField>

              <FormField
                error={form.formState.errors.expectedBreakMinutes}
                hint="Standard scheduled break time during this shift (0-1440)."
                htmlFor="expectedBreakMinutes"
                label="Expected break duration (minutes)"
              >
                <Input
                  {...form.register("expectedBreakMinutes")}
                  aria-invalid={Boolean(
                    form.formState.errors.expectedBreakMinutes,
                  )}
                  id="expectedBreakMinutes"
                  min="0"
                  placeholder="60"
                  type="number"
                />
              </FormField>

              <FormField
                error={form.formState.errors.minimumBreakMinutes}
                hint="Optional minimum break duration required (must not exceed expected break)."
                htmlFor="minimumBreakMinutes"
                label="Minimum break required (minutes)"
              >
                <Input
                  {...form.register("minimumBreakMinutes")}
                  aria-invalid={Boolean(
                    form.formState.errors.minimumBreakMinutes,
                  )}
                  id="minimumBreakMinutes"
                  min="0"
                  placeholder="30"
                  type="number"
                />
              </FormField>
            </div>

            {/* Flexible Hours Option */}
            <div className="rounded-lg border border-border p-4">
              <label
                className="flex cursor-pointer items-start gap-3"
                htmlFor="flexible-shift"
              >
                <input
                  {...form.register("flexible")}
                  className="mt-1 size-4 rounded border-border text-primary focus:ring-primary"
                  id="flexible-shift"
                  type="checkbox"
                />
                <div>
                  <span className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                    <Sparkles aria-hidden="true" className="size-4 text-primary" />
                    Flexible Shift Timing
                  </span>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Allow assigned employees flexible check-in and check-out times while maintaining the total daily hours requirement.
                  </p>
                </div>
              </label>
            </div>
          </CardContent>
        </Card>
      </fieldset>

      {formMessage && (
        <div
          className="rounded-lg border border-info/20 bg-info-soft p-3 text-sm text-info"
          role="status"
        >
          {formMessage}
        </div>
      )}

      {mutation.error && (
        <div
          className="flex gap-2 rounded-lg border border-destructive/20 bg-destructive-soft p-3 text-sm text-destructive"
          role="alert"
        >
          <AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {getShiftErrorMessage(mutation.error)}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
        <Link
          className={cn(buttonVariants({ variant: "outline" }), "sm:min-w-28")}
          href={shift ? `/admin/shifts/${shift.id}` : "/admin/shifts"}
        >
          Cancel
        </Link>
        <Button
          className="sm:min-w-40"
          disabled={mutation.isPending}
          type="submit"
        >
          {mutation.isPending ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <Save aria-hidden="true" className="size-4" />
          )}
          {mutation.isPending
            ? "Saving..."
            : mode === "create"
              ? "Create shift"
              : "Save changes"}
        </Button>
      </div>
    </form>
  );
}
