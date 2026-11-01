"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowLeft, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-error-message";
import {
  dashboardForRole,
  getSafeRedirectPath,
} from "@/features/auth/lib/auth-routes";
import { resendCooldownSeconds } from "@/features/auth/lib/otp-cooldown";
import {
  requestOtpSchema,
  verifyOtpSchema,
  type VerifyOtpFormValues,
} from "@/features/auth/schemas/auth-schemas";
import { requestOtp, verifyOtp } from "@/features/auth/services/auth-service";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";

function maskEmail(email: string) {
  const [local, domain] = email.split("@");
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"•".repeat(Math.max(2, local.length - visible.length))}@${domain}`;
}

export function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { establishSession } = useAuth();
  const emailResult = useMemo(
    () => requestOtpSchema.safeParse({ email: searchParams.get("email") ?? "" }),
    [searchParams],
  );
  const email = emailResult.success ? emailResult.data.email : null;
  const redirect = searchParams.get("redirect");
  const [cooldown, setCooldown] = useState(resendCooldownSeconds);
  const form = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((current) => Math.max(0, current - 1));
    }, 1_000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const verifyMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (response) => {
      establishSession(response);
      router.replace(
        getSafeRedirectPath(redirect, response.user.role) ??
          dashboardForRole(response.user.role),
      );
    },
  });

  const resendMutation = useMutation({
    mutationFn: requestOtp,
    onSuccess: () => {
      setCooldown(resendCooldownSeconds);
      form.reset();
    },
  });

  if (!email) {
    return (
      <div className="text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-xl bg-warning-soft text-warning">
          <ShieldCheck aria-hidden="true" className="size-6" />
        </span>
        <h2 className="mt-5 text-2xl font-bold tracking-tight">Request a new code</h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          This verification link is missing a valid email address. Return to sign in to request a code.
        </p>
        <Link className={cn(buttonVariants(), "mt-7 w-full")} href="/login">
          Return to sign in
        </Link>
      </div>
    );
  }

  const otpField = form.register("otp");
  const loginParams = new URLSearchParams();
  if (redirect) loginParams.set("redirect", redirect);
  const loginHref = loginParams.size ? `/login?${loginParams.toString()}` : "/login";

  return (
    <div>
      <Link
        className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        href={loginHref}
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Back to sign in
      </Link>
      <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-primary">
        Check your email
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight">Enter your sign-in code</h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        If the account is eligible, a six-digit code was sent to{" "}
        <span className="font-semibold text-foreground">{maskEmail(email)}</span>. The code expires in five minutes.
      </p>

      <form
        className="mt-8 space-y-5"
        noValidate
        onSubmit={form.handleSubmit(({ otp }) =>
          verifyMutation.mutate({ email, otp: otp.trim() }),
        )}
      >
        <div className="space-y-2">
          <Label htmlFor="otp">Six-digit code</Label>
          <Input
            {...otpField}
            aria-describedby={form.formState.errors.otp ? "otp-error" : "otp-help"}
            aria-invalid={Boolean(form.formState.errors.otp)}
            autoComplete="one-time-code"
            autoFocus
            className="h-14 text-center font-mono text-xl font-bold tracking-[0.42em]"
            id="otp"
            inputMode="numeric"
            maxLength={6}
            onChange={(event) => {
              event.currentTarget.value = event.currentTarget.value.replace(/\D/g, "");
              otpField.onChange(event);
            }}
            pattern="[0-9]{6}"
            placeholder="000000"
          />
          {form.formState.errors.otp ? (
            <p className="text-sm text-destructive" id="otp-error" role="alert">
              {form.formState.errors.otp.message}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground" id="otp-help">
              Enter numbers only. Each code can be used once.
            </p>
          )}
        </div>

        {verifyMutation.isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive-soft p-3 text-sm text-destructive" role="alert">
            {getAuthErrorMessage(verifyMutation.error)}
          </div>
        ) : null}

        <Button className="w-full" disabled={verifyMutation.isPending} size="lg" type="submit">
          {verifyMutation.isPending && (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          )}
          {verifyMutation.isPending ? "Verifying…" : "Verify and sign in"}
        </Button>
      </form>

      <div className="mt-6 border-t border-border pt-5 text-center">
        {resendMutation.isSuccess ? (
          <p className="mb-3 text-sm text-success" role="status">
            If the account is eligible, a new code has been sent.
          </p>
        ) : null}
        {resendMutation.isError ? (
          <p className="mb-3 text-sm text-destructive" role="alert">
            {getAuthErrorMessage(resendMutation.error)}
          </p>
        ) : null}
        <Button
          disabled={cooldown > 0 || resendMutation.isPending}
          onClick={() => resendMutation.mutate({ email })}
          type="button"
          variant="ghost"
        >
          <RefreshCw
            aria-hidden="true"
            className={cn("size-4", resendMutation.isPending && "animate-spin")}
          />
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend sign-in code"}
        </Button>
      </div>
    </div>
  );
}
