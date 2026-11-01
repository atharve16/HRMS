"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { synchronizeDepartmentQueries } from "@/features/departments/hooks/department-mutation-utils";
import { createDepartment } from "@/features/departments/services/department-service";

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: (department) => synchronizeDepartmentQueries(queryClient, department),
  });
}
