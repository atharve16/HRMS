import { z } from "zod";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const requestOtpSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your work email address.")
    .max(254, "Email must be 254 characters or fewer.")
    .email("Enter a valid email address.")
    .transform(normalizeEmail),
});

export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the six-digit code from your email."),
});

export type RequestOtpFormValues = z.input<typeof requestOtpSchema>;
export type VerifyOtpFormValues = z.input<typeof verifyOtpSchema>;
