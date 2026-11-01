import { Badge } from "@/components/ui/badge";
import type { OfficeStatus } from "@/features/office-locations/types/office-location-types";
import { officeStatusLabels } from "@/features/office-locations/utils/office-location-display";

export function OfficeLocationStatusBadge({ status }: { status: OfficeStatus }) {
  return (
    <Badge variant={status === "ACTIVE" ? "success" : "neutral"}>
      {officeStatusLabels[status]}
    </Badge>
  );
}

