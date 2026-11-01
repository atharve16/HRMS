"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { synchronizeDepartmentQueries } from "@/features/departments/hooks/department-mutation-utils";
import { reactivateDepartment } from "@/features/departments/services/department-service";

export function useReactivateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reactivateDepartment,
    onSuccess: (department) => synchronizeDepartmentQueries(queryClient, department),
  });
}
