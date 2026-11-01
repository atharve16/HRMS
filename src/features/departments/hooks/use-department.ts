"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { departmentKeys } from "@/features/departments/hooks/department-query-keys";
import {
  getDepartment,
  listDepartmentOptions,
} from "@/features/departments/services/department-service";

export function departmentQueryOptions(departmentId: string) {
  return queryOptions({
    queryKey: departmentKeys.detail(departmentId),
    queryFn: () => getDepartment(departmentId),
    enabled: Boolean(departmentId),
  });
}

export function useDepartment(departmentId: string) {
  return useQuery(departmentQueryOptions(departmentId));
}

export function useDepartmentOptions() {
  return useQuery({
    queryKey: departmentKeys.options(),
    queryFn: listDepartmentOptions,
    staleTime: 5 * 60_000,
  });
}
