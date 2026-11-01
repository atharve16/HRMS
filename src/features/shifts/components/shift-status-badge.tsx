import { Badge } from "@/components/ui/badge";
import type { ShiftStatus } from "@/features/shifts/types/shift-types";
import { shiftStatusLabels } from "@/features/shifts/utils/shift-display";

export function ShiftStatusBadge({ status }: { status: ShiftStatus }) {
  return (
    <Badge variant={status === "ACTIVE" ? "success" : "neutral"}>
      {shiftStatusLabels[status]}
    </Badge>
  );
}

