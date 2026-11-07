import { ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { useAdminDashboard } from "@/features/dashboard/hooks/use-admin-dashboard";
import { formatDateShort } from "@/features/dashboard/utils/dashboard-time";
import { LeaveStatusBadge } from "@/features/leaves/components/leave-status-badge";
import { LeaveTypeBadge } from "@/features/leaves/components/leave-type-badge";
import { cn } from "@/lib/utils";

type AdminPendingLeavesProps = {
  dashboard: ReturnType<typeof useAdminDashboard>;
};

export function AdminPendingLeaves({ dashboard }: AdminPendingLeavesProps) {
  const { pendingLeavesQuery } = dashboard;
  const requests = pendingLeavesQuery.data?.content ?? [];
  const totalElements = pendingLeavesQuery.data?.totalElements ?? 0;
  const isLoading = pendingLeavesQuery.isLoading;
  const isError = pendingLeavesQuery.isError;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Pending leave requests</CardTitle>
          <CardDescription>
            {totalElements === 1
              ? "1 employee request awaiting review"
              : `${totalElements} employee requests awaiting review`}
          </CardDescription>
        </div>
        <Link
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
          href="/admin/leaves"
        >
          Review in Leave Center
          <ArrowRight aria-hidden="true" className="size-3.5 ml-1" />
        </Link>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        {isLoading ? (
          <div className="p-6 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : isError ? (
          <div className="p-6 text-xs text-destructive">
            Failed to load pending leave requests.
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            <CheckCircle2 aria-hidden="true" className="mx-auto size-7 text-success mb-2" />
            <p className="font-medium text-foreground">Inbox is clear</p>
            <p className="mt-1">No employee leave requests are awaiting administrator review.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Leave Type</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead className="text-right">Days</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <span className="block font-medium text-foreground">
                        {item.employeeCode}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        ID: {item.employeeId}
                      </span>
                    </TableCell>
                    <TableCell>
                      <LeaveTypeBadge leaveType={item.leaveType} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays aria-hidden="true" className="size-3.5 text-muted-foreground" />
                        {formatDateShort(item.startDate)}
                        {item.startDate !== item.endDate && ` – ${formatDateShort(item.endDate)}`}
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-medium text-xs">
                      {item.totalDays} {item.totalDays === 1 ? "day" : "days"}
                    </TableCell>
                    <TableCell className="text-right">
                      <LeaveStatusBadge status={item.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

