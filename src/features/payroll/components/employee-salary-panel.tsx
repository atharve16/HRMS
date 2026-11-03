"use client";

import {
  Calendar,
  History,
  IndianRupee,
  Plus,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  PayrollErrorState,
  PayrollSkeleton,
} from "@/features/payroll/components/payroll-query-state";
import { UpsertSalaryDialog } from "@/features/payroll/components/upsert-salary-dialog";
import {
  useEmployeeSalary,
  useEmployeeSalaryHistory,
} from "@/features/payroll/hooks/use-payroll";
import { formatCurrency } from "@/features/payroll/utils/payroll-display";
import { getPayrollErrorMessage } from "@/features/payroll/utils/payroll-errors";

export function EmployeeSalaryPanel({
  employeeId,
  employeeName,
}: {
  employeeId: string;
  employeeName?: string;
}) {
  const salaryQuery = useEmployeeSalary(employeeId);
  const historyQuery = useEmployeeSalaryHistory(employeeId);

  const isLoading = salaryQuery.isLoading || historyQuery.isLoading;
  const isError = salaryQuery.isError || historyQuery.isError;
  const error = salaryQuery.error || historyQuery.error;

  const currentSalary = salaryQuery.data ?? null;
  const history = historyQuery.data ?? [];

  if (isLoading) {
    return <PayrollSkeleton />;
  }

  if (isError) {
    return (
      <PayrollErrorState
        message={getPayrollErrorMessage(error)}
        retry={() => {
          salaryQuery.refetch();
          historyQuery.refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Active Structure Card */}
      <Card className="border border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <IndianRupee className="size-4 text-primary" />
            Current Salary Structure
          </CardTitle>

          <UpsertSalaryDialog
            currentSalary={currentSalary}
            employeeId={employeeId}
            employeeName={employeeName}
            onSuccess={() => {
              salaryQuery.refetch();
              historyQuery.refetch();
            }}
          />
        </CardHeader>

        <CardContent>
          {currentSalary ? (
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <span className="text-xs text-muted-foreground block">
                  Monthly Fixed Salary
                </span>
                <p className="mt-1 text-2xl font-bold font-mono text-primary">
                  {formatCurrency(currentSalary.monthlyFixedSalary)}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <span className="text-xs text-muted-foreground block">
                  Effective From
                </span>
                <p className="mt-1 text-lg font-semibold font-mono text-foreground flex items-center gap-1.5">
                  <Calendar className="size-4 text-muted-foreground" />
                  {currentSalary.effectiveFrom}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <span className="text-xs text-muted-foreground block">Status</span>
                <div className="mt-2">
                  <Badge variant="success">Active</Badge>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center border rounded-xl border-dashed border-border bg-muted/10">
              <span className="grid size-10 place-items-center rounded-full bg-muted text-muted-foreground mb-2">
                <IndianRupee className="size-5" />
              </span>
              <p className="font-medium text-foreground text-sm">
                No active salary structure found
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-sm mb-4">
                A fixed base salary is required to calculate monthly payroll for this employee.
              </p>
              <UpsertSalaryDialog
                employeeId={employeeId}
                employeeName={employeeName}
                onSuccess={() => {
                  salaryQuery.refetch();
                  historyQuery.refetch();
                }}
                trigger={
                  <Button size="sm" type="button">
                    <Plus className="mr-1.5 size-4" />
                    Configure Initial Salary
                  </Button>
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Salary Structure History */}
      <Card className="border border-border bg-card">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <History className="size-4 text-primary" />
            Salary Structure History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground italic py-2">
              No historical salary structures recorded.
            </p>
          ) : (
            <div className="rounded-xl border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Monthly Fixed</TableHead>
                    <TableHead>Effective Period</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Configured At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-mono font-semibold text-foreground">
                        {formatCurrency(record.monthlyFixedSalary)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {record.effectiveFrom} → {record.effectiveTo || "Present"}
                      </TableCell>
                      <TableCell className="text-center">
                        {record.active ? (
                          <Badge variant="success">Active</Badge>
                        ) : (
                          <Badge variant="neutral">Superseded</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs text-muted-foreground">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

