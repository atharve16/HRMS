import { AlertTriangle, CheckCircle, Radio } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { SessionStatus } from "@/features/attendance/types/attendance-types";
import { sessionStatusConfig } from "@/features/attendance/utils/attendance-display";
import { cn } from "@/lib/utils";

export function SessionStatusBadge({
  status,
  className,
}: {
  status: SessionStatus;
  className?: string;
}) {
  const config = sessionStatusConfig[status] ?? {
    label: status,
    variant: "neutral",
  };
  const isOpen = status === "OPEN";
  const isIncomplete = status === "INCOMPLETE_CHECKOUT";

  return (
    <Badge
      className={cn("gap-1 font-medium text-xs", className)}
      variant={config.variant}
    >
      {isOpen ? (
        <Radio aria-hidden="true" className="size-3 shrink-0 animate-pulse text-warning" />
      ) : isIncomplete ? (
        <AlertTriangle aria-hidden="true" className="size-3 shrink-0 text-destructive" />
      ) : (
        <CheckCircle aria-hidden="true" className="size-3 shrink-0" />
      )}
      <span>{config.label}</span>
    </Badge>
  );
}

