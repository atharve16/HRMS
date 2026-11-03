import { Badge } from "@/components/ui/badge";
import type { LeaveStatus } from "@/features/leaves/types/leave-types";
import { LEAVE_STATUS_LABELS } from "@/features/leaves/utils/leave-display";

export function LeaveStatusBadge({ status }: { status: LeaveStatus }) {
  const variant =
    status === "APPROVED"
      ? "success"
      : status === "PENDING"
        ? "warning"
        : status === "REJECTED"
          ? "destructive"
          : "neutral";

  return <Badge variant={variant}>{LEAVE_STATUS_LABELS[status]}</Badge>;
}

