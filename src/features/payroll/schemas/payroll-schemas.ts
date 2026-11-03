import { z } from "zod";

export const PAYROLL_EARNING_TYPES = [
  "BONUS",
  "OVERTIME_PAY",
  "OTHER_EARNING",
] as const;

export const PAYROLL_DEDUCTION_TYPES = ["OTHER_DEDUCTION"] as const;

export const ALL_PAYROLL_ADJUSTMENT_TYPES = [
  ...PAYROLL_EARNING_TYPES,
  ...PAYROLL_DEDUCTION_TYPES,
] as const;

export const generatePayrollSchema = z.object({
  month: z
    .number()
    .int("Month must be an integer.")
    .min(1, "Month must be between 1 and 12.")
    .max(12, "Month must be between 1 and 12."),
  year: z
    .number()
    .int("Year must be an integer.")
    .min(2000, "Year must be 2000 or later.")
    .max(2100, "Year must be 2100 or earlier."),
});

export type GeneratePayrollFormValues = {
  month: number;
  year: number;
};

export const upsertSalarySchema = z.object({
  monthlyFixedSalary: z
    .number()
    .positive("Monthly fixed salary must be greater than 0."),
  effectiveFrom: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Effective from date must be in YYYY-MM-DD format."),
});

export type UpsertSalaryFormValues = {
  monthlyFixedSalary: number;
  effectiveFrom: string;
};

export const payrollAdjustmentInputSchema = z.object({
  type: z.enum(ALL_PAYROLL_ADJUSTMENT_TYPES, {
    error: "Adjustment type is required.",
  }),
  description: z
    .string()
    .trim()
    .min(1, "Description is required.")
    .max(200, "Description must be 200 characters or fewer."),
  amount: z
    .number()
    .positive("Amount must be greater than 0."),
});

export type PayrollAdjustmentInputFormValues = {
  type: (typeof ALL_PAYROLL_ADJUSTMENT_TYPES)[number];
  description: string;
  amount: number;
};

export const updateDraftPayrollSchema = z.object({
  earnings: z.array(payrollAdjustmentInputSchema).default([]),
  deductions: z.array(payrollAdjustmentInputSchema).default([]),
});

export type UpdateDraftPayrollFormValues = {
  earnings: PayrollAdjustmentInputFormValues[];
  deductions: PayrollAdjustmentInputFormValues[];
};
