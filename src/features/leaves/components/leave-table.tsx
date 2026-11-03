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

export function LeaveTable({
  leaves,
  isAdmin = false,
}: {
  leaves: LeaveRequestResponse[];
  isAdmin?: boolean;
}) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            {isAdmin && <TableHead>Employee</TableHead>}
            <TableHead>Type</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Days</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {leaves.map((leave) => {
            const canCancel = !isAdmin && canEmployeeCancel(leave.status);
            const canReview = isAdmin && canAdminReview(leave.status);

            return (
              <TableRow key={leave.id}>
                {isAdmin && (
                  <TableCell className="font-semibold text-foreground">
                    <Link
                      href={`/admin/leaves/${leave.id}`}
                      className="hover:underline"
                    >
                      {leave.employeeCode}
                    </Link>
                  </TableCell>
                )}
                <TableCell>
                  <LeaveTypeBadge
                    leaveType={leave.leaveType}
                    showPaidBadge={true}
                  />
                </TableCell>
                <TableCell className="font-medium text-foreground">
                  {formatLeaveDateRange(leave.startDate, leave.endDate)}
                </TableCell>
                <TableCell>{formatDays(leave.totalDays)}</TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                  {leave.reason}
                </TableCell>
                <TableCell>
                  <LeaveStatusBadge status={leave.status} />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {isAdmin && (
                      <Link
                        href={`/admin/leaves/${leave.id}`}
                        className={buttonVariants({ variant: "ghost", size: "sm" })}
                        aria-label={`View leave details for ${leave.id}`}
                      >
                        <Eye className="size-4" />
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

