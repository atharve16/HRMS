"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { synchronizeDepartmentQueries } from "@/features/departments/hooks/department-mutation-utils";
import { updateDepartment } from "@/features/departments/services/department-service";
import type { UpdateDepartmentRequest } from "@/features/departments/types/department-types";

export function useUpdateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ departmentId, request }: { departmentId: string; request: UpdateDepartmentRequest }) =>
      updateDepartment(departmentId, request),
    onSuccess: (department) => synchronizeDepartmentQueries(queryClient, department),
  });
}
