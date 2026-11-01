import type { QueryClient } from "@tanstack/react-query";

import { employeeKeys } from "@/features/employees/hooks/employee-query-keys";
import type { Employee } from "@/features/employees/types/employee-types";

export function synchronizeEmployeeQueries(
  queryClient: QueryClient,
  employee: Employee,
) {
  queryClient.setQueryData(employeeKeys.detail(employee.id), employee);
  void queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
  void queryClient.invalidateQueries({ queryKey: employeeKeys.managers() });
  void queryClient.invalidateQueries({ queryKey: employeeKeys.self() });
}
