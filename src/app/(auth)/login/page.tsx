import type { Metadata } from "next";
import { Suspense } from "react";

import { AuthLoading } from "@/features/auth/components/auth-loading";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <AuthShell>
      <Suspense fallback={<AuthLoading label="Preparing sign in" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
