import { CheckCircle2, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { AssignmentStatus } from "@/features/work-assignments/types/work-assignment-types";
import { assignmentStatusLabels } from "@/features/work-assignments/utils/work-assignment-display";
import { cn } from "@/lib/utils";

export function WorkAssignmentStatusBadge({
  status,
  className,
}: {
  status: AssignmentStatus;
  className?: string;
}) {
  const isActive = status === "ACTIVE";

  return (
    <Badge
      className={cn("gap-1 font-medium", className)}
      variant={isActive ? "success" : "neutral"}
    >
      {isActive ? (
        <CheckCircle2 aria-hidden="true" className="size-3" />
      ) : (
        <Clock aria-hidden="true" className="size-3" />
      )}
      <span>{assignmentStatusLabels[status] ?? status}</span>
    </Badge>
  );
}
