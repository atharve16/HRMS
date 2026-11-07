import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmployeeAvatar } from "@/features/employees/components/employee-avatar";
import { EmployeeStatusBadge } from "@/features/employees/components/employee-status-badge";
import type { useAdminDashboard } from "@/features/dashboard/hooks/use-admin-dashboard";
import { formatDateShort } from "@/features/dashboard/utils/dashboard-time";
import { cn } from "@/lib/utils";

type AdminRecentEmployeesProps = {
  dashboard: ReturnType<typeof useAdminDashboard>;
};

export function AdminRecentEmployees({ dashboard }: AdminRecentEmployeesProps) {
  const { recentEmployeesQuery } = dashboard;
  const employees = recentEmployeesQuery.data?.content ?? [];
  const isLoading = recentEmployeesQuery.isLoading;
  const isError = recentEmployeesQuery.isError;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Recently added employees</CardTitle>
          <CardDescription>Newest staff members registered in the organization.</CardDescription>
        </div>
        <Link
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
          href="/admin/employees"
        >
          View directory
          <ArrowRight aria-hidden="true" className="size-3.5 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : isError ? (
          <p className="text-xs text-destructive">Failed to load recent employees.</p>
        ) : employees.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            <Users aria-hidden="true" className="mx-auto size-6 text-muted-foreground/60 mb-2" />
            <p className="font-medium text-foreground">No employees found</p>
            <p className="mt-1">Add employee accounts to build your organization.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {employees.map((emp) => (
              <div key={emp.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3 min-w-0">
                  <EmployeeAvatar
                    className="size-9"
                    employee={{
                      firstName: emp.firstName,
                      lastName: emp.lastName,
                    }}
                  />
                  <div className="min-w-0">
                    <Link
                      className="font-medium text-foreground text-sm hover:underline truncate block"
                      href={`/admin/employees/${emp.id}`}
                    >
                      {emp.firstName} {emp.lastName}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">{emp.employeeCode}</span>
                      <span>·</span>
                      <span className="truncate">{emp.designation || "No designation"}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 ml-3">
                  <span className="text-[11px] text-muted-foreground hidden sm:inline">
                    Joined {formatDateShort(emp.joiningDate)}
                  </span>
                  <EmployeeStatusBadge status={emp.employmentStatus} />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

