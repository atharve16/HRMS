"use client";

import { AlertCircle, RotateCcw } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AuthLoading } from "@/features/auth/components/auth-loading";
import { getRouteDecision } from "@/features/auth/lib/auth-routes";
import type { UserRole } from "@/features/auth/types/auth";
import { useAuth } from "@/providers/auth-provider";
import { isApiClientError } from "@/services/api-error";

export function RoleGuard({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole: UserRole;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, status, restorationError, retryRestoration } = useAuth();

  const isConfirmedAuthFailure =
    isApiClientError(restorationError) && restorationError.status === 401;
  const isConnectionFailure =
    Boolean(restorationError) && !isConfirmedAuthFailure;

  const decision = getRouteDecision(
    requiredRole,
    status === "authenticated" ? (session?.user.role ?? null) : null,
    pathname,
  );

  useEffect(() => {
    // Only redirect to login when NOT loading and the session is confirmed dead.
    // Temporary network failures, timeouts, and 5xx errors must NOT boot the user to login.
    if (status !== "loading" && !decision.allowed && !isConnectionFailure) {
      if (process.env.NODE_ENV !== "production") {
        console.log(
          `[RoleGuard] Access denied for route "${pathname}". Status: ${status}. Redirecting to: ${decision.redirectTo}`,
        );
      }
      router.replace(decision.redirectTo);
    }
  }, [decision, isConnectionFailure, pathname, router, status]);

  if (status === "loading") return <AuthLoading />;

  if (isConnectionFailure && !session) {
    return (
      <div
        aria-live="polite"
        className="flex min-h-svh items-center justify-center bg-background px-4"
        role="alert"
      >
        <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle aria-hidden="true" className="size-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Unable to reach server
              </h2>
              <p className="text-xs text-muted-foreground">
                Connection interrupted or backend warming up
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            We could not verify your session with the server. Your login is preserved. Please try again.
          </p>
          <div className="mt-5 flex flex-col gap-2">
            <button
              onClick={retryRestoration}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-xs font-semibold text-primary-foreground shadow transition hover:opacity-90"
              type="button"
            >
              <RotateCcw className="size-3.5" />
              Retry Connection
            </button>
            <button
              onClick={() => router.replace("/login")}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-xs font-medium text-foreground transition hover:bg-muted"
              type="button"
            >
              Sign in with another email
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!decision.allowed) return <AuthLoading />;
  return children;
}
