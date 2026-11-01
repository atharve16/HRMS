"use client";

import { queryOptions, useQuery } from "@tanstack/react-query";

import { departmentKeys } from "@/features/departments/hooks/department-query-keys";
import { listDepartments } from "@/features/departments/services/department-service";
import type { DepartmentListParams } from "@/features/departments/types/department-types";

export function departmentsQueryOptions(params: DepartmentListParams) {
  return queryOptions({
    queryKey: departmentKeys.list(params),
    queryFn: () => listDepartments(params),
    placeholderData: (previous) => previous,
  });
}

export function useDepartments(params: DepartmentListParams) {
  return useQuery(departmentsQueryOptions(params));
}
