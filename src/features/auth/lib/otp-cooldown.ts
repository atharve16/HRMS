const DEFAULT_RESEND_COOLDOWN_SECONDS = 60;

export function getResendCooldownSeconds(value: string | undefined) {
  if (!value) return DEFAULT_RESEND_COOLDOWN_SECONDS;

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : DEFAULT_RESEND_COOLDOWN_SECONDS;
}

export const resendCooldownSeconds = getResendCooldownSeconds(
  process.env.NEXT_PUBLIC_OTP_RESEND_COOLDOWN_SECONDS,
);
