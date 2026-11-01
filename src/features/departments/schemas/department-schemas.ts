import { z } from "zod";

const departmentCodePattern = /^[A-Za-z0-9_-]{2,20}$/;
const objectIdPattern = /^[a-f\d]{24}$/i;

export const departmentFormSchema = z.object({
  departmentCode: z
    .string()
    .trim()
    .min(1, "Department code is required.")
    .regex(departmentCodePattern, "Use 2-20 letters, numbers, underscores, or hyphens."),
  name: z.string().trim().min(1, "Department name is required.").max(120),
  description: z.string().trim().max(1000),
  managerEmployeeId: z
    .string()
    .refine((value) => !value || objectIdPattern.test(value), "Select a valid active employee."),
});

export type DepartmentFormValues = z.input<typeof departmentFormSchema>;
