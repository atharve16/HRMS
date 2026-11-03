"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Edit, LoaderCircle } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useUpdateHoliday } from "@/features/holidays/hooks/use-holidays";
import {
  updateHolidaySchema,
  type UpdateHolidayFormValues,
} from "@/features/holidays/schemas/holiday-schemas";
import type { AdminHolidayResponse } from "@/features/holidays/types/holiday-types";
import { getHolidayErrorMessage } from "@/features/holidays/utils/holiday-errors";

export function EditHolidayDialog({
  holiday,
  trigger,
  onUpdated,
}: {
  holiday: AdminHolidayResponse;
  trigger?: React.ReactNode;
  onUpdated?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const updateMutation = useUpdateHoliday();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateHolidayFormValues>({
    resolver: zodResolver(updateHolidaySchema),
    defaultValues: {
      name: holiday.name,
      date: holiday.date,
      description: holiday.description || "",
    },
  });

  useEffect(() => {
    reset({
      name: holiday.name,
      date: holiday.date,
      description: holiday.description || "",
    });
  }, [holiday, reset]);

  const onSubmit = async (values: UpdateHolidayFormValues) => {
    try {
      await updateMutation.mutateAsync({
        holidayId: holiday.id,
        request: {
          name: values.name ? values.name.trim() : undefined,
          date: values.date ? values.date.trim() : undefined,
          description: values.description ? values.description.trim() : null,
        },
      });
      setOpen(false);
      onUpdated?.();
    } catch {
      // Error handled by mutation state
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button type="button" variant="outline" size="sm">
            <Edit className="mr-1.5 size-3.5" />
            Edit
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogTitle>Edit company holiday</AlertDialogTitle>
        <AlertDialogDescription>
          Update holiday details. Changes will be updated across employee calendars.
        </AlertDialogDescription>

        {updateMutation.isError && (
          <div className="mt-3 flex items-start gap-2.5 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">Unable to update holiday</p>
              <p className="text-xs">
                {getHolidayErrorMessage(updateMutation.error)}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="editHolidayName">Holiday name</Label>
            <Input
              id="editHolidayName"
              {...register("name")}
              aria-invalid={Boolean(errors.name)}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editHolidayDate">Date</Label>
            <Input
              id="editHolidayDate"
              type="date"
              {...register("date")}
              aria-invalid={Boolean(errors.date)}
            />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="editHolidayDesc">Description (optional)</Label>
            <Textarea
              id="editHolidayDesc"
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
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
            </AlertDialogClose>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && (
                <LoaderCircle className="mr-2 size-4 animate-spin" />
              )}
              Save changes
            </Button>
          </div>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

