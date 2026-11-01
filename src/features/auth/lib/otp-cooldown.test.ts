import { describe, expect, it } from "vitest";

import { getResendCooldownSeconds } from "@/features/auth/lib/otp-cooldown";

describe("OTP resend cooldown", () => {
  it("uses the backend-aligned default", () => {
    expect(getResendCooldownSeconds(undefined)).toBe(60);
  });

  it("accepts a valid public override", () => {
    expect(getResendCooldownSeconds("45")).toBe(45);
  });

  it.each(["0", "-1", "invalid"])("rejects invalid override %s", (value) => {
    expect(getResendCooldownSeconds(value)).toBe(60);
  });
});
