import { CheckCircle2, Clock, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LeaveBalanceResponse } from "@/features/leaves/types/leave-types";
import { formatDays } from "@/features/leaves/utils/leave-display";

export function LeaveBalanceCards({
  balances,
  year,
}: {
  balances: LeaveBalanceResponse[];
  year?: number;
}) {
  if (!balances || balances.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Leave Balances {year ? `(${year})` : ""}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {balances.map((balance) => {
          const available = balance.availableDays;
          const allocated = balance.allocatedDays;
          const used = balance.usedDays;
          const pending = balance.pendingDays;

          return (
            <Card
              key={balance.id || `${balance.leaveType}-${balance.year}`}
              className="relative overflow-hidden transition-shadow hover:shadow-md"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-foreground">
                  {balance.leaveTypeName || balance.leaveType}
                </CardTitle>
                <span className="rounded-md bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">
                  {balance.leaveType}
                </span>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-3xl font-bold tracking-tight text-foreground">
                    {available}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDays(available)} available
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t pt-3 text-center text-xs">
                  <div>
                    <span className="flex items-center justify-center gap-1 text-muted-foreground">
                      <ShieldCheck className="size-3 text-muted-foreground" />
                      Allocated
                    </span>
                    <span className="font-semibold text-foreground">
                      {allocated}
                    </span>
                  </div>
                  <div>
                    <span className="flex items-center justify-center gap-1 text-muted-foreground">
                      <CheckCircle2 className="size-3 text-muted-foreground" />
                      Used
                    </span>
                    <span className="font-semibold text-foreground">{used}</span>
                  </div>
                  <div>
                    <span className="flex items-center justify-center gap-1 text-muted-foreground">
                      <Clock className="size-3 text-muted-foreground" />
                      Pending
                    </span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">
                      {pending}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

