"use client";

import {
  ArrowLeft,
  Calendar,
  Clock,
  FileText,
  User,
  UserCheck,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ApproveLeaveDialog } from "@/features/leaves/components/approve-leave-dialog";
import {
  LeaveErrorState,
  LeaveSkeleton,
} from "@/features/leaves/components/leave-query-state";
import { LeaveStatusBadge } from "@/features/leaves/components/leave-status-badge";
import { LeaveTypeBadge } from "@/features/leaves/components/leave-type-badge";
import { RejectLeaveDialog } from "@/features/leaves/components/reject-leave-dialog";
import { useLeaveDetail } from "@/features/leaves/hooks/use-leaves";
import {
  canAdminReview,
  formatDays,
  formatLeaveDateRange,
  LEAVE_TYPE_LABELS,
} from "@/features/leaves/utils/leave-display";
import { getLeaveErrorMessage } from "@/features/leaves/utils/leave-errors";

export function AdminLeaveDetailScreen({ leaveId: propLeaveId }: { leaveId?: string } = {}) {
  const routeParams = useParams<{ leaveId: string }>();
  const leaveId = propLeaveId || routeParams?.leaveId || "";
  const { data: leave, isLoading, isError, error, refetch } = useLeaveDetail(leaveId);

  if (isLoading) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Link
            href="/admin/leaves"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Back to leave requests
          </Link>
          <LeaveSkeleton />
        </div>
      </PageContainer>
    );
  }

  if (isError || !leave) {
    return (
      <PageContainer>
        <div className="space-y-6">
          <Link
            href="/admin/leaves"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Back to leave requests
          </Link>
          <LeaveErrorState
            message={getLeaveErrorMessage(error)}
            retry={() => refetch()}
          />
        </div>
      </PageContainer>
    );
  }

  const canReview = canAdminReview(leave.status);

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <Link
            href="/admin/leaves"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "mb-2",
            })}
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Back to leave requests
          </Link>
          <PageHeader
            title={`Leave Request — ${leave.employeeCode}`}
            description={`Application ID: ${leave.id}`}
            actions={
              canReview ? (
                <div className="flex items-center gap-2">
                  <RejectLeaveDialog leave={leave} />
                  <ApproveLeaveDialog leave={leave} />
                </div>
              ) : undefined
            }
          />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Details */}
          <div className="space-y-6 md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="size-4 text-primary" />
                  Leave Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 border-b pb-4 sm:grid-cols-3">
                  <div>
                    <span className="text-xs text-muted-foreground">Status</span>
                    <div className="mt-1">
                      <LeaveStatusBadge status={leave.status} />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Type</span>
                    <div className="mt-1">
                      <LeaveTypeBadge
                        leaveType={leave.leaveType}
                        showPaidBadge={true}
                      />
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Total Days</span>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatDays(leave.totalDays)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Requested Date Range
                    </span>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatLeaveDateRange(leave.startDate, leave.endDate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">
                      Leave Type Description
                    </span>
                    <p className="mt-1 text-sm text-foreground">
                      {leave.leaveTypeName || LEAVE_TYPE_LABELS[leave.leaveType]}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <FileText className="size-4 text-primary" />
                  Reason for Leave
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap rounded-lg bg-muted/40 p-4 text-sm text-foreground">
                  {leave.reason || "No reason provided."}
                </p>
              </CardContent>
            </Card>

            {/* Review Information */}
            {leave.reviewedAt && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <UserCheck className="size-4 text-primary" />
                    Review Decision
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Reviewed By
                      </span>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {leave.reviewedBy || "Administrator"}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground">
                        Reviewed At
                      </span>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {new Date(leave.reviewedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {leave.adminRemarks && (
                    <div className="mt-2">
                      <span className="text-xs text-muted-foreground">
                        Administrative Remarks
                      </span>
                      <p className="mt-1 rounded-lg border bg-muted/30 p-3 text-sm text-foreground">
                        {leave.adminRemarks}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar Metadata */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <User className="size-4 text-primary" />
                  Employee Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground">
                    Employee Code
                  </span>
                  <p className="font-semibold text-foreground">
                    <Link
                      href={`/admin/employees/${leave.employeeId}`}
                      className="hover:underline text-primary"
                    >
                      {leave.employeeCode}
                    </Link>
                  </p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">
                    Employee Record ID
                  </span>
                  <p className="font-mono text-xs text-muted-foreground">
                    {leave.employeeId}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Clock className="size-4 text-primary" />
                  Audit Timestamps
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-xs text-muted-foreground">
                <div>
                  <span>Submitted At:</span>
                  <p className="font-medium text-foreground">
                    {new Date(leave.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span>Last Updated:</span>
                  <p className="font-medium text-foreground">
                    {new Date(leave.updatedAt).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
