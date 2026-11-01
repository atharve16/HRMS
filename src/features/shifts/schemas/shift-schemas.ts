import { z } from "zod";

import { isValidTimeString } from "@/features/shifts/utils/time-utils";

export const shiftCodePattern = /^[A-Za-z0-9_-]{2,20}$/;

export const shiftFormSchema = z
  .object({
    shiftCode: z
      .string()
      .trim()
      .min(1, "Shift code is required.")
      .regex(
        shiftCodePattern,
        "Use 2-20 letters, numbers, underscores, or hyphens.",
      ),
    name: z
      .string()
      .trim()
      .min(1, "Shift name is required.")
      .max(120, "Shift name cannot exceed 120 characters."),
    description: z
      .string()
      .trim()
      .max(1000, "Description cannot exceed 1,000 characters."),
    startTime: z
      .string()
      .trim()
      .min(1, "Start time is required.")
      .refine(isValidTimeString, "Enter a valid start time (HH:mm)."),
    endTime: z
      .string()
      .trim()
      .min(1, "End time is required.")
      .refine(isValidTimeString, "Enter a valid end time (HH:mm)."),
    workingDays: z
      .array(
        z.enum([
          "MONDAY",
          "TUESDAY",
          "WEDNESDAY",
          "THURSDAY",
          "FRIDAY",
          "SATURDAY",
          "SUNDAY",
        ]),
      )
      .min(1, "Select at least one working day."),
    gracePeriodMinutes: z
      .string()
      .trim()
      .refine((val) => {
        const num = Number(val);
        return Number.isInteger(num) && num >= 0 && num <= 1440;
      }, "Grace period must be an integer between 0 and 1,440 minutes."),
    earlyDepartureGraceMinutes: z
      .string()
      .trim()
      .refine((val) => {
        const num = Number(val);
        return Number.isInteger(num) && num >= 0 && num <= 1440;
      }, "Early departure grace must be an integer between 0 and 1,440 minutes."),
    expectedBreakMinutes: z
      .string()
      .trim()
      .refine((val) => {
        const num = Number(val);
        return Number.isInteger(num) && num >= 0 && num <= 1440;
      }, "Expected break must be an integer between 0 and 1,440 minutes."),
    minimumBreakMinutes: z
      .string()
      .trim()
      .refine((val) => {
        if (!val) return true;
        const num = Number(val);
        return Number.isInteger(num) && num >= 0 && num <= 1440;
      }, "Minimum break must be an integer between 0 and 1,440 minutes."),
    flexible: z.boolean(),
  })
  .superRefine((values, context) => {
    if (values.minimumBreakMinutes && values.expectedBreakMinutes) {
      const min = Number(values.minimumBreakMinutes);
      const exp = Number(values.expectedBreakMinutes);
      if (Number.isFinite(min) && Number.isFinite(exp) && min > exp) {
        context.addIssue({
          code: "custom",
          path: ["minimumBreakMinutes"],
          message: "Minimum break cannot exceed expected break minutes.",
        });
      }
    }
  });

export type ShiftFormValues = z.input<typeof shiftFormSchema>;

