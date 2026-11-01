import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthLoading } from "@/features/auth/components/auth-loading";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { OtpForm } from "@/features/auth/components/otp-form";

export const metadata: Metadata = { title: "Verify sign-in code" };

export default function VerifyOtpPage() {
  return (
    <AuthShell>
      <Suspense fallback={<AuthLoading label="Preparing verification" />}>
        <OtpForm />
      </Suspense>
    </AuthShell>
  );
}
