import { ArrowRight, Building2 } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import type { useAdminDashboard } from "@/features/dashboard/hooks/use-admin-dashboard";
import { cn } from "@/lib/utils";

type AdminDepartmentDistributionProps = {
  dashboard: ReturnType<typeof useAdminDashboard>;
};

export function AdminDepartmentDistribution({ dashboard }: AdminDepartmentDistributionProps) {
  const {
    departmentDistribution,
    isDepartmentCountsLoading,
    departmentsQuery,
    activeEmployeesQuery,
  } = dashboard;

  const totalActive = activeEmployeesQuery.data?.totalElements ?? 0;
  const isError = departmentsQuery.isError;

  // Calculate unassigned employees count
  const assignedCount = departmentDistribution.reduce(
    (sum, item) => sum + item.employeeCount,
    0,
  );
  const unassignedCount = Math.max(0, totalActive - assignedCount);
  const unassignedPct =
    totalActive > 0 ? Math.round((unassignedCount / totalActive) * 100 * 10) / 10 : 0;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Department distribution</CardTitle>
          <CardDescription>Active workforce headcount across company divisions.</CardDescription>
        </div>
        <Link
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
          href="/admin/departments"
        >
          Manage departments
          <ArrowRight aria-hidden="true" className="size-3.5 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {isDepartmentCountsLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : isError ? (
          <p className="rounded-lg bg-destructive-soft p-4 text-xs text-destructive">
            Failed to load department distributions.
          </p>
        ) : departmentDistribution.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            <Building2 aria-hidden="true" className="mx-auto size-6 text-muted-foreground/60 mb-2" />
            <p className="font-medium text-foreground">No active departments found</p>
            <p className="mt-1">Add departments in department management to see distribution.</p>
          </div>
        ) : (
          <div className="space-y-3.5">
            {departmentDistribution.map((dept) => (
              <div key={dept.departmentId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">
                    {dept.name}{" "}
                    <span className="font-mono text-muted-foreground">({dept.departmentCode})</span>
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {dept.employeeCount} {dept.employeeCount === 1 ? "member" : "members"} ({dept.percentage}%)
                  </span>
                </div>
                <Progress
                  indicatorClassName="bg-primary"
                  label={`${dept.name} share`}
                  value={dept.percentage}
                />
              </div>
            ))}

            {unassignedCount > 0 && (
              <div className="space-y-1 pt-1 border-t border-border">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-muted-foreground">Unassigned / General</span>
                  <span className="font-mono text-muted-foreground">
                    {unassignedCount} {unassignedCount === 1 ? "member" : "members"} ({unassignedPct}%)
                  </span>
                </div>
                <Progress
                  indicatorClassName="bg-muted-foreground/40"
                  label="Unassigned share"
                  value={unassignedPct}
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

