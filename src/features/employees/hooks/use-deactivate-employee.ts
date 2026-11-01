"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { synchronizeEmployeeQueries } from "@/features/employees/hooks/employee-mutation-utils";
import { deactivateEmployee } from "@/features/employees/services/employee-service";

export function useDeactivateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateEmployee,
    onSuccess: (employee) => synchronizeEmployeeQueries(queryClient, employee),
  });
}
