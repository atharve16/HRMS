"use client";

import { AlertCircle, Coins, PlusCircle } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { AllocateBalanceDialog } from "@/features/leaves/components/allocate-balance-dialog";
import { useEmployeeLeaveBalances } from "@/features/leaves/hooks/use-leaves";
import { formatDays } from "@/features/leaves/utils/leave-display";
import { getLeaveErrorMessage } from "@/features/leaves/utils/leave-errors";

export function EmployeeLeaveBalancePanel({ employeeId }: { employeeId: string }) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const {
    data: balances,
    isLoading,
    isError,
    error,
    refetch,
  } = useEmployeeLeaveBalances(employeeId, selectedYear);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Select
            value={String(selectedYear)}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-36"
            aria-label="Filter leave balance by year"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((yr) => (
              <option key={yr} value={yr}>
                Year {yr}
              </option>
            ))}
          </Select>
        </div>

        <AllocateBalanceDialog
          employeeId={employeeId}
          year={selectedYear}
          trigger={
            <Button type="button" size="sm">
              <PlusCircle className="mr-1.5 size-4" />
              Allocate balance
            </Button>
          }
        />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 w-full animate-pulse rounded-xl bg-muted"
            />
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load leave balances</p>
            <p className="text-xs">{getLeaveErrorMessage(error)}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-2"
            >
              Try again
            </Button>
          </div>
        </div>
      ) : !balances || balances.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-xl border border-dashed p-6 text-center">
          <Coins className="size-8 text-muted-foreground" />
          <h4 className="mt-2 text-sm font-semibold text-foreground">
            No leave balances allocated for {selectedYear}
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            Allocate annual leave quotas (CL, SL, EL, CO) for this employee.
          </p>
          <div className="mt-4">
            <AllocateBalanceDialog
              employeeId={employeeId}
              year={selectedYear}
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {balances.map((balance) => (
            <Card
              key={balance.id || `${balance.leaveType}-${balance.year}`}
              className="relative overflow-hidden"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold">
                  {balance.leaveTypeName || balance.leaveType}
                </CardTitle>
                <span className="rounded bg-primary-soft px-1.5 py-0.5 text-xs font-bold text-primary">
                  {balance.leaveType}
                </span>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-2xl font-bold tracking-tight text-foreground">
                    {balance.availableDays}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatDays(balance.availableDays)} available
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-1 border-t pt-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-muted-foreground">Allocated</span>
                    <p className="font-semibold text-foreground">
                      {balance.allocatedDays}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Used</span>
                    <p className="font-semibold text-foreground">
                      {balance.usedDays}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground">Pending</span>
                    <p className="font-semibold text-amber-600 dark:text-amber-400">
                      {balance.pendingDays}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-2">
                  <AllocateBalanceDialog
                    employeeId={employeeId}
                    year={selectedYear}
                    existingBalance={balance}
                    trigger={
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full text-xs"
                      >
                        Adjust allocation
                      </Button>
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

