"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { synchronizeEmployeeQueries } from "@/features/employees/hooks/employee-mutation-utils";
import { updateEmployee } from "@/features/employees/services/employee-service";
import type { UpdateEmployeeRequest } from "@/features/employees/types/employee-types";

export function useUpdateEmployee() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      request,
    }: {
      employeeId: string;
      request: UpdateEmployeeRequest;
    }) => updateEmployee(employeeId, request),
    onSuccess: (employee) => synchronizeEmployeeQueries(queryClient, employee),
  });
}
