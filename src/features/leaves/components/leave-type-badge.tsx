import { Badge } from "@/components/ui/badge";
import type { LeaveType } from "@/features/leaves/types/leave-types";
import { isPaidLeave, LEAVE_TYPE_LABELS } from "@/features/leaves/utils/leave-display";

export function LeaveTypeBadge({
  leaveType,
  showPaidBadge = false,
}: {
  leaveType: LeaveType;
  showPaidBadge?: boolean;
}) {
  const isPaid = isPaidLeave(leaveType);
  const label = LEAVE_TYPE_LABELS[leaveType] || leaveType;

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <Badge variant="default">{label}</Badge>
      {showPaidBadge && (
        <Badge variant={isPaid ? "info" : "neutral"} className="text-[10px]">
          {isPaid ? "Paid" : "Unpaid"}
        </Badge>
      )}
    </div>
  );
}

