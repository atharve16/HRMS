"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { synchronizeEmployeeQueries } from "@/features/employees/hooks/employee-mutation-utils";
import { reactivateEmployee } from "@/features/employees/services/employee-service";

export function useReactivateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reactivateEmployee,
    onSuccess: (employee) => synchronizeEmployeeQueries(queryClient, employee),
  });
}
