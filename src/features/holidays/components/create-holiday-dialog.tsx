"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CalendarPlus, LoaderCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useCreateHoliday } from "@/features/holidays/hooks/use-holidays";
import {
  createHolidaySchema,
  type CreateHolidayFormValues,
} from "@/features/holidays/schemas/holiday-schemas";
import { getHolidayErrorMessage } from "@/features/holidays/utils/holiday-errors";

export function CreateHolidayDialog({
  trigger,
}: {
  trigger?: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const createMutation = useCreateHoliday();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateHolidayFormValues>({
    resolver: zodResolver(createHolidaySchema),
    defaultValues: {
      name: "",
      date: today,
      description: "",
    },
  });

  const onSubmit = async (values: CreateHolidayFormValues) => {
    try {
      await createMutation.mutateAsync({
        name: values.name,
        date: values.date,
        description: values.description ? values.description.trim() : null,
      });
      reset();
      setOpen(false);
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button type="button">
            <CalendarPlus className="mr-2 size-4" />
            Declare holiday
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogTitle>Declare company holiday</AlertDialogTitle>
        <AlertDialogDescription>
          Add a new company-wide paid holiday. Active holidays are excluded from
          employee leave deductions and announced in the company calendar.
        </AlertDialogDescription>

        {createMutation.isError && (
          <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">Unable to declare holiday</p>
              <p className="text-xs">
                {getHolidayErrorMessage(createMutation.error)}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="holidayName">Holiday name</Label>
            <Input
              id="holidayName"
              placeholder="e.g. Republic Day"
              {...register("name")}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="holidayDate">Date</Label>
            <Input
              id="holidayDate"
              type="date"
              {...register("date")}
              aria-invalid={Boolean(errors.date)}
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="holidayDesc">Description (optional)</Label>
            <Textarea
              id="holidayDesc"
              placeholder="Brief description or significance of the holiday..."
              rows={3}
              {...register("description")}
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <AlertDialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
            </AlertDialogClose>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              )}
              Declare holiday
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

