import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WorkAssignmentEndDialog } from "@/features/work-assignments/components/work-assignment-end-dialog";
import { WorkAssignmentStatusBadge } from "@/features/work-assignments/components/work-assignment-status-badge";
import type { WorkAssignment } from "@/features/work-assignments/types/work-assignment-types";
import { formatEffectiveRange } from "@/features/work-assignments/utils/work-assignment-display";
import { cn } from "@/lib/utils";

export function WorkAssignmentCard({
  assignment,
  shiftName,
  officeName,
}: {
  assignment: WorkAssignment;
  shiftName?: string;
  officeName?: string;
}) {
  const isActive = assignment.status === "ACTIVE";

  return (
    <Card className={cn("overflow-hidden", isActive ? "border-primary/30" : "opacity-90")}>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-base">
                {shiftName || "Shift " + assignment.shiftId.slice(-6)}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
              <span>{officeName || "Location " + assignment.officeLocationId.slice(-6)}</span>
            </div>
          </div>
          <WorkAssignmentStatusBadge status={assignment.status} />
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="font-medium text-foreground">Period:</span>
            <span>{formatEffectiveRange(assignment.effectiveFrom, assignment.effectiveTo)}</span>
          </div>
          {assignment.reason && (
            <div className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground italic">
              &quot;{assignment.reason}&quot;
            </div>
          )}
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
            <Clock aria-hidden="true" className="size-3 shrink-0" />
            <span>Assigned {new Date(assignment.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
          <Link
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "text-xs px-2")}
            href={`/admin/work-assignments/${assignment.id}`}
          >
            Details
            <ArrowRight aria-hidden="true" className="size-3 ml-1" />
          </Link>
          {isActive && (
            <WorkAssignmentEndDialog
              assignment={assignment}
              officeName={officeName}
              shiftName={shiftName}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}

