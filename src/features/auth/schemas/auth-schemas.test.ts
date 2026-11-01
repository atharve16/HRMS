import { describe, expect, it } from "vitest";

import {
  requestOtpSchema,
  verifyOtpSchema,
} from "@/features/auth/schemas/auth-schemas";

describe("authentication schemas", () => {
  it("normalizes email the same way as the backend", () => {
    const result = requestOtpSchema.parse({ email: "  Person@Example.COM  " });
    expect(result.email).toBe("person@example.com");
  });

  it("rejects malformed email addresses", () => {
    expect(requestOtpSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });

  it.each(["12345", "1234567", "12a456", "      "])(
    "rejects invalid OTP value %s",
    (otp) => {
      expect(verifyOtpSchema.safeParse({ otp }).success).toBe(false);
    },
  );

  it("accepts exactly six digits", () => {
    expect(verifyOtpSchema.parse({ otp: "123456" }).otp).toBe("123456");
  });
});
