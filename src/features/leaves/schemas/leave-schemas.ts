import { z } from "zod";

export const LEAVE_TYPES = ["CL", "SL", "EL", "LWP", "CO"] as const;
export const ALLOCATABLE_LEAVE_TYPES = ["CL", "SL", "EL", "CO"] as const;
export const LEAVE_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const;

export const applyLeaveSchema = z
  .object({
    leaveType: z.enum(LEAVE_TYPES, {
      error: "Leave type is required.",
    }),
    startDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format."),
    endDate: z
      .string()
      .trim()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format."),
    reason: z
      .string()
      .trim()
      .min(1, "Reason is required.")
      .max(500, "Reason must be 500 characters or fewer."),
  })
  .superRefine((data, ctx) => {
    const today = new Date().toISOString().slice(0, 10);

    if (data.startDate && data.startDate < today) {
      ctx.addIssue({
        code: "custom",
        message: "Leave start date cannot be in the past.",
        path: ["startDate"],
      });
    }

    if (data.startDate && data.endDate && data.endDate < data.startDate) {
      ctx.addIssue({
        code: "custom",
        message: "End date cannot be earlier than start date.",
        path: ["endDate"],
      });
    }
  });

export type ApplyLeaveFormValues = z.infer<typeof applyLeaveSchema>;

export const rejectLeaveSchema = z.object({
  remarks: z
    .string()
    .trim()
    .min(1, "Rejection remarks are required.")
    .max(500, "Remarks must be 500 characters or fewer."),
});

export type RejectLeaveFormValues = z.infer<typeof rejectLeaveSchema>;

export const allocateBalanceSchema = z.object({
  leaveType: z.enum(ALLOCATABLE_LEAVE_TYPES, {
    error: "Leave type is required.",
  }),
  year: z
    .number()
    .int("Year must be a whole number.")
    .min(2000, "Year must be 2000 or later.")
    .max(2100, "Year must be 2100 or earlier."),
  allocatedDays: z
    .number()
    .min(0, "Allocated days must be 0 or greater.")
    .max(365, "Allocated days cannot exceed 365."),
});

export type AllocateBalanceFormValues = z.infer<typeof allocateBalanceSchema>;

