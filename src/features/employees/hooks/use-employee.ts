"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { employeeKeys } from "@/features/employees/hooks/employee-query-keys";
import { getEmployee, getMyEmployeeProfile } from "@/features/employees/services/employee-service";

export function employeeQueryOptions(employeeId: string) {
  return queryOptions({
    queryKey: employeeKeys.detail(employeeId),
    queryFn: () => getEmployee(employeeId),
    enabled: Boolean(employeeId),
  });
}

export function useEmployee(employeeId: string) {
  return useQuery(employeeQueryOptions(employeeId));
}

export function useMyEmployeeProfile() {
  return useQuery({
    queryKey: employeeKeys.self(),
    queryFn: getMyEmployeeProfile,
  });
}
