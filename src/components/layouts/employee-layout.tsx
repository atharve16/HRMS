"use client";

import type { ReactNode } from "react";

import { employeeNavigation } from "@/constants/navigation";
import { getUserIdentity } from "@/features/auth/lib/user-display";
import { useAuth } from "@/providers/auth-provider";

import { DashboardShell } from "./dashboard-shell";

export function EmployeeLayout({ children }: { children: ReactNode }) {
  const { session } = useAuth();
  if (!session) return null;

  return (
    <DashboardShell
      identity={getUserIdentity(session.user)}
      navigation={employeeNavigation}
    >
      {children}
    </DashboardShell>
  );
}
