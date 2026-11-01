import { Badge } from "@/components/ui/badge";
import type { EmploymentStatus } from "@/features/employees/types/employee-types";
import { employmentStatusLabels } from "@/features/employees/utils/employee-display";

export function EmployeeStatusBadge({ status }: { status: EmploymentStatus }) {
  const variant =
    status === "ACTIVE" ? "success" : status === "INACTIVE" ? "warning" : "destructive";
  return <Badge variant={variant}>{employmentStatusLabels[status]}</Badge>;
}
