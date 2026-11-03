import { Eye } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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

export function PayrollCard({
  payroll,
}: {
  payroll: PayrollResponse;
}) {
  const payableDays = payroll.attendedDays + payroll.paidLeaveDays;

  return (
    <Card className="border border-border bg-card">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <Link
              className="font-medium text-foreground hover:underline"
              href={`/admin/payroll/${payroll.id}`}
            >
              {payroll.employeeNameSnapshot || "Employee"}
            </Link>
            <p className="text-xs text-muted-foreground">
              {payroll.employeeCodeSnapshot}{" "}
              {payroll.departmentSnapshot ? `• ${payroll.departmentSnapshot}` : ""}
            </p>
          </div>
          <PayrollStatusBadge status={payroll.status} />
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs border-y border-border/60 py-2">
          <div>
            <span className="text-muted-foreground">Period:</span>
            <p className="font-medium text-foreground">
              {formatPayrollPeriod(payroll.payrollMonth, payroll.payrollYear)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Payable Days:</span>
            <p className="font-mono font-medium text-foreground">
              {payableDays} / {payroll.scheduledWorkingDays}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Fixed Salary:</span>
            <p className="font-mono font-medium text-foreground">
              {formatCurrency(payroll.monthlyFixedSalarySnapshot)}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Net Salary:</span>
            <p className="font-mono font-bold text-foreground">
              {formatCurrency(payroll.netSalary)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <Link
            className={buttonVariants({ size: "sm", variant: "outline" })}
            href={`/admin/payroll/${payroll.id}`}
          >
            <Eye className="mr-1 size-3.5" /> Details
          </Link>

          <div className="flex items-center gap-1.5">
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
        </div>
      </CardContent>
    </Card>
  );
}
