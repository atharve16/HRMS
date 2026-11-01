"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { employeeKeys } from "@/features/employees/hooks/employee-query-keys";
import { createEmployee } from "@/features/employees/services/employee-service";

export function useCreateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createEmployee,
    onSuccess: (employee) => {
      queryClient.setQueryData(employeeKeys.detail(employee.id), employee);
      void queryClient.invalidateQueries({ queryKey: employeeKeys.lists() });
      void queryClient.invalidateQueries({ queryKey: employeeKeys.managers() });
    },
  });
}
