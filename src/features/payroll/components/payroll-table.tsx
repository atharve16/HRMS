import { Eye } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditDraftPayrollDialog } from "@/features/payroll/components/edit-draft-payroll-dialog";
import { PayrollLifecycleDialog } from "@/features/payroll/components/payroll-lifecycle-dialog";
import { PayrollStatusBadge } from "@/features/payroll/components/payroll-status-badge";
import type { PayrollResponse } from "@/features/payroll/types/payroll-types";
import {
  canEditDraft,
  canFinalize,
  canPay,
  canReview,
  formatCurrency,
  formatPayrollPeriod,
} from "@/features/payroll/utils/payroll-display";

export function PayrollTable({
  payrolls,
}: {
  payrolls: PayrollResponse[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Period</TableHead>
            <TableHead className="text-right">Fixed Base</TableHead>
            <TableHead className="text-center">Days (Pay / Sched)</TableHead>
            <TableHead className="text-right">Net Payable</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payrolls.map((payroll) => {
            const payableDays = payroll.attendedDays + payroll.paidLeaveDays;
            return (
              <TableRow key={payroll.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <Link
                      className="font-medium text-foreground hover:underline"
                      href={`/admin/payroll/${payroll.id}`}
                    >
                      {payroll.employeeNameSnapshot || "Employee"}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {payroll.employeeCodeSnapshot}{" "}
                      {payroll.departmentSnapshot ? `• ${payroll.departmentSnapshot}` : ""}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="text-sm">
                  {formatPayrollPeriod(payroll.payrollMonth, payroll.payrollYear)}
                </TableCell>

                <TableCell className="text-right font-mono text-sm">
                  {formatCurrency(payroll.monthlyFixedSalarySnapshot)}
                </TableCell>

                <TableCell className="text-center text-sm font-mono">
                  {payableDays} / {payroll.scheduledWorkingDays}
                </TableCell>

                <TableCell className="text-right font-mono font-semibold text-foreground">
                  {formatCurrency(payroll.netSalary)}
                </TableCell>

                <TableCell className="text-center">
                  <PayrollStatusBadge status={payroll.status} />
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      aria-label={`View details for ${payroll.employeeNameSnapshot}`}
                      className={buttonVariants({ size: "sm", variant: "ghost" })}
                      href={`/admin/payroll/${payroll.id}`}
                    >
                      <Eye className="size-4" />
                    </Link>

                    {canEditDraft(payroll.status) && (
                      <EditDraftPayrollDialog
                        payroll={payroll}
                        trigger={
                          <button
                            className={buttonVariants({ size: "sm", variant: "outline" })}
                            type="button"
                          >
                            Adjust
                          </button>
                        }
                      />
                    )}

                    {canReview(payroll.status) && (
                      <PayrollLifecycleDialog action="review" payroll={payroll} />
                    )}

                    {canFinalize(payroll.status) && (
                      <PayrollLifecycleDialog action="finalize" payroll={payroll} />
                    )}

                    {canPay(payroll.status) && (
                      <PayrollLifecycleDialog action="pay" payroll={payroll} />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
