"use client";

import type { ReactNode } from "react";

import { adminNavigation } from "@/constants/navigation";
import { getUserIdentity } from "@/features/auth/lib/user-display";
import { useAuth } from "@/providers/auth-provider";

import { DashboardShell } from "./dashboard-shell";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  if (!session) return null;

  return (
    <DashboardShell
      identity={getUserIdentity(session.user)}
      navigation={adminNavigation}
    >
      {children}
    </DashboardShell>
  );
}
