import { z } from "zod";

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

export const createAssignmentSchema = z
  .object({
    shiftId: z.string().trim().min(1, "Shift is required."),
    officeLocationId: z.string().trim().min(1, "Office location is required."),
    effectiveFrom: z
      .string()
      .trim()
      .min(1, "Effective start date is required.")
      .regex(isoDatePattern, "Enter a valid date in YYYY-MM-DD format."),
    effectiveTo: z
      .string()
      .trim()
      .regex(isoDatePattern, "Enter a valid date in YYYY-MM-DD format.")
      .or(z.literal(""))
      .optional(),
    reason: z
      .string()
      .trim()
      .max(500, "Reason must be 500 characters or fewer.")
      .optional(),
  })
  .superRefine((values, context) => {
    if (
      values.effectiveTo &&
      values.effectiveFrom &&
      values.effectiveTo < values.effectiveFrom
    ) {
      context.addIssue({
        code: "custom",
        path: ["effectiveTo"],
        message: "Effective end date cannot be earlier than start date.",
      });
    }
  });

export const endAssignmentSchema = z.object({
  effectiveTo: z
    .string()
    .trim()
    .min(1, "Effective end date is required.")
    .regex(isoDatePattern, "Enter a valid date in YYYY-MM-DD format."),
  reason: z
    .string()
    .trim()
    .max(500, "Reason must be 500 characters or fewer.")
    .optional(),
});

export type CreateAssignmentFormValues = z.input<typeof createAssignmentSchema>;
export type EndAssignmentFormValues = z.input<typeof endAssignmentSchema>;

