import type { Employee } from "@/features/employees/types/employee-types";
import { employeeInitials } from "@/features/employees/utils/employee-display";
import { cn } from "@/lib/utils";

export function EmployeeAvatar({
  employee,
  className,
}: {
  employee: Pick<Employee, "firstName" | "lastName">;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-xs font-bold text-primary",
        className,
      )}
    >
      {employeeInitials(employee)}
    </span>
  );
}
