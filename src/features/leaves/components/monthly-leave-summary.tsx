"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyMonthlyLeaveBalances } from "@/features/leaves/hooks/use-leaves";
import type { LeaveType } from "@/features/leaves/types/leave-types";
import { LEAVE_TYPE_LABELS } from "@/features/leaves/utils/leave-display";

const TYPES: Exclude<LeaveType, "LWP">[] = ["CL", "SL", "EL", "CO"];

export function MonthlyLeaveSummary({ month }: { month: string }) {
  const query = useMyMonthlyLeaveBalances(month);
  const byType = new Map(query.data?.map((balance) => [balance.leaveType, balance]));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Current monthly leave balance</CardTitle>
        <p className="text-xs text-muted-foreground">Allocation, reservations, usage and expiry for {month}.</p>
      </CardHeader>
      <CardContent>
        {query.isLoading ? <div className="h-24 animate-pulse rounded-lg bg-muted" /> : query.isError ? (
          <p className="text-sm text-destructive">Unable to load monthly leave balances.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TYPES.map((type) => {
              const balance = byType.get(type);
              return <div className="rounded-lg border bg-muted/20 p-3" key={type}>
                <div className="flex items-center justify-between"><span className="text-sm font-semibold">{type}</span><span className="text-xs text-muted-foreground">{LEAVE_TYPE_LABELS[type]}</span></div>
                <p className="mt-3 text-2xl font-semibold">{balance?.availableDays ?? 0}</p>
                <div className="mt-2 grid grid-cols-3 gap-1 text-[11px] text-muted-foreground">
                  <span>Allocated {balance?.allocatedDays ?? 0}</span><span>Used {balance?.usedDays ?? 0}</span><span>Pending {balance?.pendingDays ?? 0}</span>
                </div>
                {type === "EL" && (balance?.carriedForwardDays ?? 0) > 0 && <p className="mt-2 text-xs text-primary">+{balance?.carriedForwardDays} carried forward</p>}
                {(balance?.expiredDays ?? 0) > 0 && <p className="mt-1 text-xs text-warning">{balance?.expiredDays} expired</p>}
              </div>;
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
