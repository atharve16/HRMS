import { CheckCircle2, Clock, AlertTriangle, XCircle, Calendar, Coffee } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { AttendanceStatus } from "@/features/attendance/types/attendance-types";
import { attendanceStatusConfig } from "@/features/attendance/utils/attendance-display";
import { cn } from "@/lib/utils";

const statusIcons: Record<AttendanceStatus, typeof CheckCircle2> = {
  PRESENT: CheckCircle2,
  PARTIAL: Clock,
  INCOMPLETE: AlertTriangle,
  ABSENT: XCircle,
  HOLIDAY: Calendar,
  ON_LEAVE: Coffee,
};

export function AttendanceStatusBadge({
  status,
  className,
}: {
  status: AttendanceStatus;
  className?: string;
}) {
  const config = attendanceStatusConfig[status] ?? {
    label: status,
    variant: "neutral",
    description: "",
  };
  const Icon = statusIcons[status] ?? Clock;

  return (
    <Badge
      className={cn("gap-1 font-medium text-xs", className)}
      variant={config.variant}
    >
      <Icon aria-hidden="true" className="size-3 shrink-0" />
      <span>{config.label}</span>
    </Badge>
  );
}

