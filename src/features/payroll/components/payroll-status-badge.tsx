import { Badge } from "@/components/ui/badge";
import type { PayrollStatus } from "@/features/payroll/types/payroll-types";
import { PAYROLL_STATUS_LABELS } from "@/features/payroll/utils/payroll-display";

export function PayrollStatusBadge({ status }: { status: PayrollStatus }) {
  const variant =
    status === "PAID"
      ? "success"
      : status === "FINALIZED"
        ? "default"
        : status === "REVIEWED"
          ? "info"
          : "warning";

  return <Badge variant={variant}>{PAYROLL_STATUS_LABELS[status]}</Badge>;
}

