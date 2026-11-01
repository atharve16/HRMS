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
import { WorkAssignmentEndDialog } from "@/features/work-assignments/components/work-assignment-end-dialog";
import { WorkAssignmentStatusBadge } from "@/features/work-assignments/components/work-assignment-status-badge";
import type { WorkAssignment } from "@/features/work-assignments/types/work-assignment-types";
import { formatEffectiveRange } from "@/features/work-assignments/utils/work-assignment-display";
import { cn } from "@/lib/utils";

export function WorkAssignmentTable({
  assignments,
  shiftsMap,
  officesMap,
}: {
  assignments: WorkAssignment[];
  shiftsMap?: Map<string, string>;
  officesMap?: Map<string, string>;
}) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Shift</TableHead>
            <TableHead>Office location</TableHead>
            <TableHead>Effective period</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Assigned</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assignments.map((assignment) => {
            const shiftName = shiftsMap?.get(assignment.shiftId) || assignment.shiftId;
            const officeName = officesMap?.get(assignment.officeLocationId) || assignment.officeLocationId;
            const isActive = assignment.status === "ACTIVE";

            return (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium text-foreground">
                  {shiftName}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {officeName}
                </TableCell>
                <TableCell className="whitespace-nowrap text-sm">
                  {formatEffectiveRange(assignment.effectiveFrom, assignment.effectiveTo)}
                </TableCell>
                <TableCell>
                  <WorkAssignmentStatusBadge status={assignment.status} />
                </TableCell>
                <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground" title={assignment.reason || undefined}>
                  {assignment.reason || "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                  {new Date(assignment.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link
                      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs")}
                      href={`/admin/work-assignments/${assignment.id}`}
                    >
                      Details
                    </Link>
                    {isActive && (
                      <WorkAssignmentEndDialog
                        assignment={assignment}
                        officeName={officeName}
                        shiftName={shiftName}
                      />
                    )}
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

