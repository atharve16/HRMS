import type { QueryClient } from "@tanstack/react-query";

import { departmentKeys } from "@/features/departments/hooks/department-query-keys";
import type { Department } from "@/features/departments/types/department-types";

export function synchronizeDepartmentQueries(
  queryClient: QueryClient,
  department: Department,
) {
  queryClient.setQueryData(departmentKeys.detail(department.id), department);
  void queryClient.invalidateQueries({ queryKey: departmentKeys.lists() });
  void queryClient.invalidateQueries({ queryKey: departmentKeys.options() });
}
