import { ArrowRight, CalendarDays } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { useEmployeeDashboard } from "@/features/dashboard/hooks/use-employee-dashboard";
import { LeaveTypeBadge } from "@/features/leaves/components/leave-type-badge";
import { LEAVE_TYPE_LABELS } from "@/features/leaves/utils/leave-display";
import { cn } from "@/lib/utils";

type EmployeeLeaveBalancesProps = {
  dashboard: ReturnType<typeof useEmployeeDashboard>;
};

export function EmployeeLeaveBalances({ dashboard }: EmployeeLeaveBalancesProps) {
  const { leaveBalancesQuery } = dashboard;
  const balances = leaveBalancesQuery.data ?? [];
  const isLoading = leaveBalancesQuery.isLoading;
  const isError = leaveBalancesQuery.isError;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Leave balances</CardTitle>
          <CardDescription>
            Your current annual allocations and remaining available balances.
          </CardDescription>
        </div>
        <Link
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
          href="/employee/leaves"
        >
          Apply or view all
          <ArrowRight aria-hidden="true" className="size-3.5 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Skeleton className="h-28 w-full" />
            <Skeleton className="h-28 w-full" />
          </div>
        ) : isError ? (
          <p className="rounded-lg bg-destructive-soft p-4 text-xs text-destructive">
            Failed to load leave balances.
          </p>
        ) : balances.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
            <CalendarDays aria-hidden="true" className="mx-auto size-6 text-muted-foreground/60 mb-2" />
            <p className="font-medium text-foreground">No leave balances assigned yet</p>
            <p className="mt-1">Allocations configured by HR will display here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {balances.map((balance) => {
              const label = LEAVE_TYPE_LABELS[balance.leaveType] ?? balance.leaveType;
              return (
                <div
                  key={`${balance.leaveType}-${balance.year}`}
                  className="rounded-lg border border-border p-4 bg-muted/20 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{label}</p>
                      <p className="text-[11px] text-muted-foreground">Year {balance.year}</p>
                    </div>
                    <LeaveTypeBadge leaveType={balance.leaveType} />
                  </div>

                  <div className="grid grid-cols-4 gap-2 pt-1 border-t border-border/60 text-center text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground block">Allocated</span>
                      <span className="font-medium text-foreground">{balance.allocatedDays}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground block">Used</span>
                      <span className="font-medium text-muted-foreground">{balance.usedDays}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground block">Pending</span>
                      <span className="font-medium text-warning">{balance.pendingDays}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase text-muted-foreground block font-bold text-success">
                        Available
                      </span>
                      <span className="font-bold text-success text-sm">{balance.availableDays}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

