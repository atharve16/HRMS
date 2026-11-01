import type { ReactNode } from "react";
import { Suspense } from "react";

import { AdminLayout } from "@/components/layouts/admin-layout";
import { AuthLoading } from "@/features/auth/components/auth-loading";
import { RoleGuard } from "@/features/auth/components/role-guard";

export default function AdminRouteLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <RoleGuard requiredRole="ADMIN">
        <AdminLayout>{children}</AdminLayout>
      </RoleGuard>
    </Suspense>
  );
}
