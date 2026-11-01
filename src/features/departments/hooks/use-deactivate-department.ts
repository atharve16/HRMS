"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { synchronizeDepartmentQueries } from "@/features/departments/hooks/department-mutation-utils";
import { deactivateDepartment } from "@/features/departments/services/department-service";

export function useDeactivateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateDepartment,
    onSuccess: (department) => synchronizeDepartmentQueries(queryClient, department),
  });
}
