import { Badge } from "@/components/ui/badge";
import type { DepartmentStatus } from "@/features/departments/types/department-types";
import { departmentStatusLabels } from "@/features/departments/utils/department-display";

export function DepartmentStatusBadge({ status }: { status: DepartmentStatus }) {
  return (
    <Badge variant={status === "ACTIVE" ? "success" : "neutral"}>
      {departmentStatusLabels[status]}
    </Badge>
  );
}
