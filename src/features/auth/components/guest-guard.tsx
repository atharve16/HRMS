"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { AuthLoading } from "@/features/auth/components/auth-loading";
import { dashboardForRole } from "@/features/auth/lib/auth-routes";
import { useAuth } from "@/providers/auth-provider";

export function GuestGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { session, status } = useAuth();

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace(dashboardForRole(session.user.role));
    }
  }, [router, session, status]);

  if (status !== "unauthenticated") return <AuthLoading />;
  return children;
}
