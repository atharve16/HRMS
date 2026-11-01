"use client";

import { useQuery } from "@tanstack/react-query";

import { employeeKeys } from "@/features/employees/hooks/employee-query-keys";
import { listEmployees } from "@/features/employees/services/employee-service";

export function useManagerOptions() {
  return useQuery({
    queryKey: employeeKeys.managers(),
    queryFn: () =>
      listEmployees({
        page: 0,
        limit: 100,
        employmentStatus: "ACTIVE",
        sortBy: "firstName",
        sortDirection: "asc",
      }),
    staleTime: 60_000,
  });
}
