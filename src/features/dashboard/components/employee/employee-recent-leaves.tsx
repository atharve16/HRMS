import { ArrowRight, CalendarDays, FileText } from "lucide-react";
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
import type { useEmployeeDashboard } from "@/features/dashboard/hooks/use-employee-dashboard";
import { formatDateShort } from "@/features/dashboard/utils/dashboard-time";
import { LeaveStatusBadge } from "@/features/leaves/components/leave-status-badge";
import { LeaveTypeBadge } from "@/features/leaves/components/leave-type-badge";
import { cn } from "@/lib/utils";

type EmployeeRecentLeavesProps = {
  dashboard: ReturnType<typeof useEmployeeDashboard>;
};

export function EmployeeRecentLeaves({ dashboard }: EmployeeRecentLeavesProps) {
  const { myLeavesQuery } = dashboard;
  const requests = myLeavesQuery.data?.content ?? [];
  const isLoading = myLeavesQuery.isLoading;
  const isError = myLeavesQuery.isError;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Recent leave applications</CardTitle>
          <CardDescription>Status and remarks on your requested time off.</CardDescription>
        </div>
        <Link
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "text-xs")}
          href="/employee/leaves"
        >
          View all requests
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
            Failed to load leave requests.
          </div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-xs text-muted-foreground">
            <FileText aria-hidden="true" className="mx-auto size-7 text-muted-foreground/60 mb-2" />
            <p className="font-medium text-foreground">No leave applications filed yet</p>
            <p className="mt-1">When you apply for leave, requests will track here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead className="text-right">Days</TableHead>
                  <TableHead>Status & Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((item) => (
                  <TableRow key={item.id}>
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
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <LeaveStatusBadge status={item.status} />
                        {item.adminRemarks && (
                          <span className="text-[11px] text-muted-foreground italic truncate max-w-xs">
                            &ldquo;{item.adminRemarks}&rdquo;
                          </span>
                        )}
                      </div>
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

