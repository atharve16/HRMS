"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { employeeKeys } from "@/features/employees/hooks/employee-query-keys";
import { listEmployees } from "@/features/employees/services/employee-service";
import type { EmployeeListParams } from "@/features/employees/types/employee-types";

export function employeesQueryOptions(params: EmployeeListParams) {
  return queryOptions({
    queryKey: employeeKeys.list(params),
    queryFn: () => listEmployees(params),
    placeholderData: (previous) => previous,
  });
}

export function useEmployees(params: EmployeeListParams) {
  return useQuery(employeesQueryOptions(params));
}
