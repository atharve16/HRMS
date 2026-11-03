import { z } from "zod";

export const createHolidaySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Holiday name is required.")
    .max(120, "Holiday name must be 120 characters or fewer."),
  description: z
    .string()
    .trim()
    .max(500, "Description must be 500 characters or fewer.")
    .optional()
    .or(z.literal("")),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format."),
});

export type CreateHolidayFormValues = z.infer<typeof createHolidaySchema>;

export const updateHolidaySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Holiday name cannot be empty.")
      .max(120, "Holiday name must be 120 characters or fewer.")
      .optional()
      .or(z.literal("")),
    description: z
      .string()
      .trim()
      .max(500, "Description must be 500 characters or fewer.")
      .optional()
      .or(z.literal("")),
    date: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format.")
      .optional()
      .or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const hasName = Boolean(data.name && data.name.trim().length > 0);
    const hasDesc = Boolean(data.description && data.description.trim().length > 0);
    const hasDate = Boolean(data.date && data.date.trim().length > 0);

    if (!hasName && !hasDesc && !hasDate) {
      ctx.addIssue({
        code: "custom",
        message: "At least one holiday field is required to update.",
        path: ["name"],
      });
    }
  });

export type UpdateHolidayFormValues = z.infer<typeof updateHolidaySchema>;

