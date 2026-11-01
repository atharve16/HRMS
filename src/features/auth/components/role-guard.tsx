"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AuthLoading } from "@/features/auth/components/auth-loading";
import { getRouteDecision } from "@/features/auth/lib/auth-routes";
import type { UserRole } from "@/features/auth/types/auth";
import { useAuth } from "@/providers/auth-provider";

export function RoleGuard({
  children,
  requiredRole,
}: {
  children: ReactNode;
  requiredRole: UserRole;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, status } = useAuth();
  const decision = getRouteDecision(
    requiredRole,
    status === "authenticated" ? (session?.user.role ?? null) : null,
    pathname,
  );

  useEffect(() => {
    if (status !== "loading" && !decision.allowed) {
      router.replace(decision.redirectTo);
    }
  }, [decision, router, status]);

  if (status === "loading" || !decision.allowed) return <AuthLoading />;
  return children;
}
