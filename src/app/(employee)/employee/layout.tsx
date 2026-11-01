import type { ReactNode } from "react";
import { Suspense } from "react";

import { EmployeeLayout } from "@/components/layouts/employee-layout";
import { AuthLoading } from "@/features/auth/components/auth-loading";
import { RoleGuard } from "@/features/auth/components/role-guard";

export default function EmployeeRouteLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <RoleGuard requiredRole="EMPLOYEE">
        <EmployeeLayout>{children}</EmployeeLayout>
      </RoleGuard>
    </Suspense>
  );
}
