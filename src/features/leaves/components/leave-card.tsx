import { Eye } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ApproveLeaveDialog } from "@/features/leaves/components/approve-leave-dialog";
import { CancelLeaveDialog } from "@/features/leaves/components/cancel-leave-dialog";
import { LeaveStatusBadge } from "@/features/leaves/components/leave-status-badge";
import { LeaveTypeBadge } from "@/features/leaves/components/leave-type-badge";
import { RejectLeaveDialog } from "@/features/leaves/components/reject-leave-dialog";
import type { LeaveRequestResponse } from "@/features/leaves/types/leave-types";
import {
  canAdminReview,
  canEmployeeCancel,
  formatDays,
  formatLeaveDateRange,
} from "@/features/leaves/utils/leave-display";

export function LeaveCard({
  leave,
  isAdmin = false,
}: {
  leave: LeaveRequestResponse;
  isAdmin?: boolean;
}) {
  const canCancel = !isAdmin && canEmployeeCancel(leave.status);
  const canReview = isAdmin && canAdminReview(leave.status);

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            {isAdmin && (
              <Link
                href={`/admin/leaves/${leave.id}`}
                className="font-semibold text-foreground hover:underline"
              >
                {leave.employeeCode}
              </Link>
            )}
            <div>
              <LeaveTypeBadge
                leaveType={leave.leaveType}
                showPaidBadge={true}
              />
            </div>
          </div>
          <LeaveStatusBadge status={leave.status} />
        </div>

        <div className="text-sm">
          <span className="font-medium text-foreground">
            {formatLeaveDateRange(leave.startDate, leave.endDate)}
          </span>
          <span className="ml-2 text-xs text-muted-foreground">
            ({formatDays(leave.totalDays)})
          </span>
        </div>

        {leave.reason && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {leave.reason}
          </p>
        )}

        {leave.adminRemarks && (
          <div className="rounded border bg-muted/30 p-2 text-xs">
            <span className="font-medium text-foreground">Admin remarks: </span>
            <span className="text-muted-foreground">{leave.adminRemarks}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t pt-3">
          {isAdmin && (
            <Link
              href={`/admin/leaves/${leave.id}`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Eye className="mr-1.5 size-3.5" />
              View details
            </Link>
          )}

          {canReview && (
            <>
              <ApproveLeaveDialog leave={leave} />
              <RejectLeaveDialog leave={leave} />
            </>
          )}

          {canCancel && <CancelLeaveDialog leave={leave} />}
        </div>
      </CardContent>
    </Card>
  );
}

