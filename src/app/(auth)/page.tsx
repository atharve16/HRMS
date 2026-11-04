"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { AuthLoading } from "@/features/auth/components/auth-loading";
import { dashboardForRole } from "@/features/auth/lib/auth-routes";
import { useAuth } from "@/providers/auth-provider";

export default function HomePage() {
  const router = useRouter();
  const { session, status } = useAuth();

  useEffect(() => {
    if (status === "authenticated" && session) {
      router.replace(dashboardForRole(session.user.role));
    } else if (status === "unauthenticated") {
      router.replace("/login");
    }
  }, [router, session, status]);

  return <AuthLoading label="Directing to your workspace" />;
}
