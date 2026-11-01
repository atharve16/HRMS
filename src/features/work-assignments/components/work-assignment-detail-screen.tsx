"use client";

import {
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ReactNode } from "react";

import { PageContainer } from "@/components/layouts/page-container";
import { PageHeader } from "@/components/layouts/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useEmployee } from "@/features/employees/hooks/use-employee";
import { employeeFullName } from "@/features/employees/utils/employee-display";
import { useOfficeLocation } from "@/features/office-locations/hooks/use-office-location";
import { useShift } from "@/features/shifts/hooks/use-shift";
import { WorkAssignmentEndDialog } from "@/features/work-assignments/components/work-assignment-end-dialog";
import { WorkAssignmentErrorState } from "@/features/work-assignments/components/work-assignment-query-state";
import { WorkAssignmentStatusBadge } from "@/features/work-assignments/components/work-assignment-status-badge";
import { useWorkAssignment } from "@/features/work-assignments/hooks/use-work-assignment";
import {
  formatAssignmentDate,
  formatEffectiveRange,
} from "@/features/work-assignments/utils/work-assignment-display";
import {
  getWorkAssignmentErrorMessage,
  isWorkAssignmentNotFoundError,
} from "@/features/work-assignments/utils/work-assignment-errors";
import { cn } from "@/lib/utils";

function DetailSkeleton() {
  return (
    <div aria-label="Loading assignment" className="space-y-6" role="status">
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="mt-2 h-4 w-44" />
        </CardContent>
      </Card>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-56 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
      <span className="sr-only">Loading assignment details...</span>
    </div>
  );
}

function ValueRow({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm text-foreground break-words">{children || "—"}</dd>
    </div>
  );
}

export function WorkAssignmentDetailScreen() {
  const params = useParams<{ assignmentId: string }>();
  const assignmentQuery = useWorkAssignment(params.assignmentId);
  const assignment = assignmentQuery.data;

  const employeeQuery = useEmployee(assignment?.employeeId ?? "");
  const shiftQuery = useShift(assignment?.shiftId ?? "");
  const officeQuery = useOfficeLocation(assignment?.officeLocationId ?? "");

  const employee = employeeQuery.data;
  const shift = shiftQuery.data;
  const office = officeQuery.data;

  const isActive = assignment?.status === "ACTIVE";

  return (
    <PageContainer>
      <PageHeader
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {assignment && (
              <Link
                className={buttonVariants({ variant: "outline", size: "sm" })}
                href={`/admin/work-assignments?employeeId=${assignment.employeeId}`}
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
                Employee assignments
              </Link>
            )}
            {assignment && isActive && (
              <WorkAssignmentEndDialog
                assignment={assignment}
                officeName={office?.name}
                shiftName={shift?.name}
              />
            )}
          </div>
        }
        description="Review assigned work schedule, office location geofence, and effective dates."
        eyebrow="Work assignment"
        title={
          shift && office
            ? `${shift.name} @ ${office.name}`
            : assignment
              ? `Assignment #${assignment.id.slice(-6)}`
              : "Assignment details"
        }
      />

      {assignmentQuery.isLoading ? (
        <DetailSkeleton />
      ) : assignmentQuery.isError ? (
        isWorkAssignmentNotFoundError(assignmentQuery.error) ? (
          <Card>
            <CardContent className="flex min-h-64 flex-col items-center justify-center text-center p-6">
              <h2 className="text-lg font-semibold text-foreground">Work assignment not found</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                This assignment record may have been deleted or the link is invalid.
              </p>
              <Link
                className={cn(buttonVariants({ variant: "outline" }), "mt-5")}
                href="/admin/work-assignments"
              >
                Return to assignments
              </Link>
            </CardContent>
          </Card>
        ) : (
          <WorkAssignmentErrorState
            message={getWorkAssignmentErrorMessage(assignmentQuery.error)}
            retry={() => assignmentQuery.refetch()}
          />
        )
      ) : assignment ? (
        <div className="space-y-6">
          {/* Main Status & Overview Banner */}
          <Card>
            <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-foreground">
                    {shift?.name || assignment.shiftId}
                  </h2>
                  <WorkAssignmentStatusBadge status={assignment.status} />
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Effective: {formatEffectiveRange(assignment.effectiveFrom, assignment.effectiveTo)}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                Assigned on {new Date(assignment.createdAt).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Employee Information */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <User aria-hidden="true" className="size-4 text-primary" />
                  Assigned employee
                </CardTitle>
                {employee && (
                  <Link
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    href={`/admin/employees/${employee.id}`}
                  >
                    View profile
                    <ExternalLink aria-hidden="true" className="size-3" />
                  </Link>
                )}
              </CardHeader>
              <CardContent className="pt-2">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <ValueRow label="Employee name">
                    {employee ? employeeFullName(employee) : assignment.employeeId}
                  </ValueRow>
                  <ValueRow label="Employee code">
                    {employee?.employeeCode}
                  </ValueRow>
                  <ValueRow label="Designation">
                    {employee?.designation}
                  </ValueRow>
                  <ValueRow label="Work email">
                    {employee?.email}
                  </ValueRow>
                </dl>
              </CardContent>
            </Card>

            {/* Shift Details */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Clock aria-hidden="true" className="size-4 text-primary" />
                  Work shift schedule
                </CardTitle>
                {shift && (
                  <Link
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    href={`/admin/shifts/${shift.id}`}
                  >
                    View shift
                    <ExternalLink aria-hidden="true" className="size-3" />
                  </Link>
                )}
              </CardHeader>
              <CardContent className="pt-2">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <ValueRow label="Shift name">
                    {shift?.name || assignment.shiftId}
                  </ValueRow>
                  <ValueRow label="Shift code">
                    {shift?.shiftCode}
                  </ValueRow>
                  <ValueRow label="Operating hours">
                    {shift ? `${shift.startTime.slice(0, 5)} – ${shift.endTime.slice(0, 5)}` : undefined}
                  </ValueRow>
                  <ValueRow label="Grace period">
                    {shift ? `${shift.gracePeriodMinutes} mins` : undefined}
                  </ValueRow>
                </dl>
              </CardContent>
            </Card>

            {/* Office Location Details */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <MapPin aria-hidden="true" className="size-4 text-primary" />
                  Primary office location
                </CardTitle>
                {office && (
                  <Link
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                    href={`/admin/office-locations/${office.id}`}
                  >
                    View location
                    <ExternalLink aria-hidden="true" className="size-3" />
                  </Link>
                )}
              </CardHeader>
              <CardContent className="pt-2">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <ValueRow label="Location name">
                    {office?.name || assignment.officeLocationId}
                  </ValueRow>
                  <ValueRow label="Location code">
                    {office?.locationCode}
                  </ValueRow>
                  <ValueRow label="Geofence radius">
                    {office ? `${office.geofenceRadiusMeters} meters` : undefined}
                  </ValueRow>
                  <ValueRow label="Coordinates">
                    {typeof office?.latitude === "number" && typeof office?.longitude === "number"
                      ? `${office.latitude.toFixed(5)}, ${office.longitude.toFixed(5)}`
                      : undefined}
                  </ValueRow>
                </dl>
              </CardContent>
            </Card>

            {/* Assignment Lifecycle & Metadata */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Calendar aria-hidden="true" className="size-4 text-primary" />
                  Assignment lifecycle
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <dl className="grid gap-4 sm:grid-cols-2">
                  <ValueRow label="Effective start date">
                    {formatAssignmentDate(assignment.effectiveFrom)}
                  </ValueRow>
                  <ValueRow label="Effective end date">
                    {formatAssignmentDate(assignment.effectiveTo, "Indefinite / Present")}
                  </ValueRow>
                  <ValueRow label="Reason">
                    {assignment.reason}
                  </ValueRow>
                  <ValueRow label="Assignment ID">
                    <span className="font-mono text-xs">{assignment.id}</span>
                  </ValueRow>
                </dl>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}

