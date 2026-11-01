"use client";

import { AlertCircle, CalendarClock, MapPin } from "lucide-react";
import { useMemo } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useOfficeLocationOptions } from "@/features/office-locations/hooks/use-office-location-references";
import { useShiftOptions } from "@/features/shifts/hooks/use-shift-references";
import { CreateWorkAssignmentDialog } from "@/features/work-assignments/components/create-work-assignment-dialog";
import { WorkAssignmentCard } from "@/features/work-assignments/components/work-assignment-card";
import { WorkAssignmentEndDialog } from "@/features/work-assignments/components/work-assignment-end-dialog";
import {
  WorkAssignmentEmptyState,
  WorkAssignmentErrorState,
  WorkAssignmentSkeleton,
} from "@/features/work-assignments/components/work-assignment-query-state";
import { WorkAssignmentStatusBadge } from "@/features/work-assignments/components/work-assignment-status-badge";
import { WorkAssignmentTable } from "@/features/work-assignments/components/work-assignment-table";
import { useEmployeeWorkAssignments } from "@/features/work-assignments/hooks/use-employee-work-assignments";
import {
  formatEffectiveRange,
  sortAssignmentsChronological,
} from "@/features/work-assignments/utils/work-assignment-display";
import { getWorkAssignmentErrorMessage } from "@/features/work-assignments/utils/work-assignment-errors";

export function EmployeeWorkAssignmentsPanel({
  employeeId,
  employeeName,
  canCreate = true,
}: {
  employeeId: string;
  employeeName?: string;
  canCreate?: boolean;
}) {
  const query = useEmployeeWorkAssignments(employeeId);
  const shiftsQuery = useShiftOptions();
  const officesQuery = useOfficeLocationOptions();

  const shiftsMap = useMemo(() => {
    const map = new Map<string, string>();
    shiftsQuery.data?.content.forEach((shift) => {
      map.set(
        shift.id,
        `${shift.name} (${shift.startTime.slice(0, 5)} – ${shift.endTime.slice(0, 5)})`,
      );
    });
    return map;
  }, [shiftsQuery.data]);

  const officesMap = useMemo(() => {
    const map = new Map<string, string>();
    officesQuery.data?.content.forEach((loc) => {
      map.set(loc.id, `${loc.name} (${loc.locationCode})`);
    });
    return map;
  }, [officesQuery.data]);

  if (query.isLoading) {
    return <WorkAssignmentSkeleton />;
  }

  if (query.isError) {
    return (
      <WorkAssignmentErrorState
        message={getWorkAssignmentErrorMessage(query.error)}
        retry={() => query.refetch()}
      />
    );
  }

  const rawAssignments = query.data ?? [];
  const assignments = sortAssignmentsChronological(rawAssignments);
  const activeAssignment = assignments.find((a) => a.status === "ACTIVE");

  const activeShiftName = activeAssignment
    ? shiftsMap.get(activeAssignment.shiftId) || activeAssignment.shiftId
    : undefined;
  const activeOfficeName = activeAssignment
    ? officesMap.get(activeAssignment.officeLocationId) || activeAssignment.officeLocationId
    : undefined;

  return (
    <div className="space-y-6">
      {/* Current Active Assignment Summary Card */}
      <Card className="border-border">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Current assignment status
              </span>
              {activeAssignment ? (
                <div className="mt-2 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">
                      {activeShiftName}
                    </h3>
                    <WorkAssignmentStatusBadge status={activeAssignment.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
                    <span className="inline-flex items-center gap-1">
                      <MapPin aria-hidden="true" className="size-3.5 text-primary" />
                      {activeOfficeName}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarClock aria-hidden="true" className="size-3.5" />
                      {formatEffectiveRange(activeAssignment.effectiveFrom, activeAssignment.effectiveTo)}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle aria-hidden="true" className="size-4 text-warning" />
                  <span>No active work assignment. Employee has no scheduled shift or office location.</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {activeAssignment && (
                <WorkAssignmentEndDialog
                  assignment={activeAssignment}
                  officeName={activeOfficeName}
                  shiftName={activeShiftName}
                />
              )}
              {canCreate && (
                <CreateWorkAssignmentDialog
                  employeeId={employeeId}
                  employeeName={employeeName}
                />
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment History */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-base font-semibold text-foreground">
            Assignment history ({assignments.length})
          </h3>
        </div>

        {assignments.length === 0 ? (
          <WorkAssignmentEmptyState
            action={
              canCreate ? (
                <CreateWorkAssignmentDialog
                  employeeId={employeeId}
                  employeeName={employeeName}
                />
              ) : undefined
            }
            description="Assign this employee to a shift and office location to establish attendance rules and geofencing."
            title="No assignments recorded"
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <WorkAssignmentTable
                assignments={assignments}
                officesMap={officesMap}
                shiftsMap={shiftsMap}
              />
            </div>

            {/* Mobile Cards */}
            <div className="grid gap-3 md:hidden">
              {assignments.map((assignment) => (
                <WorkAssignmentCard
                  assignment={assignment}
                  key={assignment.id}
                  officeName={officesMap.get(assignment.officeLocationId)}
                  shiftName={shiftsMap.get(assignment.shiftId)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

