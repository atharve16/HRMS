"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, LoaderCircle, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthErrorMessage } from "@/features/auth/lib/auth-error-message";
import {
  requestOtpSchema,
  type RequestOtpFormValues,
} from "@/features/auth/schemas/auth-schemas";
import { requestOtp } from "@/features/auth/services/auth-service";
import { useAuth } from "@/providers/auth-provider";
import { isApiClientError } from "@/services/api-error";

type ParsedRequestOtpValues = z.output<typeof requestOtpSchema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { restorationError, retryRestoration } = useAuth();
  const form = useForm<
    RequestOtpFormValues,
    unknown,
    ParsedRequestOtpValues
  >({
    resolver: zodResolver(requestOtpSchema),
    defaultValues: { email: "" },
  });

  const mutation = useMutation({
    mutationFn: requestOtp,
    onSuccess: (_response, variables) => {
      const params = new URLSearchParams({ email: variables.email });
      const redirect = searchParams.get("redirect");
      if (redirect) params.set("redirect", redirect);
      router.push(`/verify-otp?${params.toString()}`);
    },
  });

  const showRestorationError =
    restorationError &&
    (!isApiClientError(restorationError) ||
      !["INVALID_REFRESH_TOKEN", "REFRESH_TOKEN_REUSED"].includes(
        restorationError.code ?? "",
      ));

  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary">
        Secure employee access
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground">
        Sign in to PeopleFlow
      </h2>
      <p className="mt-3 text-sm leading-6 text-muted-foreground">
        Enter your registered work email. We&apos;ll send you a six-digit sign-in code.
      </p>

      {showRestorationError ? (
        <div className="mt-6 rounded-lg border border-warning/25 bg-warning-soft p-4 text-sm text-foreground" role="status">
          <p>{getAuthErrorMessage(restorationError)}</p>
          <button
            className="mt-2 font-semibold text-primary underline-offset-4 hover:underline"
            onClick={retryRestoration}
            type="button"
          >
            Retry session check
          </button>
        </div>
      ) : null}

      <form
        className="mt-8 space-y-5"
        noValidate
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Work email</Label>
          <div className="relative">
            <Mail
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              {...form.register("email")}
              aria-describedby={form.formState.errors.email ? "email-error" : "email-help"}
              aria-invalid={Boolean(form.formState.errors.email)}
              autoComplete="email"
              autoFocus
              className="pl-10"
              id="email"
              inputMode="email"
              placeholder="name@company.com"
              type="email"
            />
          </div>
          {form.formState.errors.email ? (
            <p className="text-sm text-destructive" id="email-error" role="alert">
              {form.formState.errors.email.message}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground" id="email-help">
              Use the email registered with your HRMS account.
            </p>
          )}
        </div>

        {mutation.isError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive-soft p-3 text-sm text-destructive" role="alert">
            {getAuthErrorMessage(mutation.error)}
          </div>
        ) : null}

        <Button className="w-full" disabled={mutation.isPending} size="lg" type="submit">
          {mutation.isPending ? (
            <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          ) : (
            <ArrowRight aria-hidden="true" className="size-4" />
          )}
          {mutation.isPending ? "Requesting code…" : "Request sign-in code"}
        </Button>
      </form>
    </div>
  );
}
