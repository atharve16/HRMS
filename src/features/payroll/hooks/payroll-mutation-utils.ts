import type { QueryClient } from "@tanstack/react-query";

import { payrollKeys } from "@/features/payroll/hooks/payroll-query-keys";
import type {
  PayrollResponse,
  SalaryStructureResponse,
} from "@/features/payroll/types/payroll-types";

export function synchronizeSalaryMutation(
  queryClient: QueryClient,
  salary: SalaryStructureResponse,
) {
  queryClient.setQueryData(payrollKeys.salary(salary.employeeId), salary);

  void queryClient.invalidateQueries({
    queryKey: payrollKeys.salary(salary.employeeId),
  });
  void queryClient.invalidateQueries({
    queryKey: payrollKeys.salaryHistory(salary.employeeId),
  });
  void queryClient.invalidateQueries({
    queryKey: payrollKeys.salaries(),
  });
}

export function synchronizePayrollMutation(
  queryClient: QueryClient,
  payroll: PayrollResponse,
) {
  queryClient.setQueryData(payrollKeys.detail(payroll.id), payroll);

  void queryClient.invalidateQueries({
    queryKey: payrollKeys.adminLists(),
  });

  if (payroll.status === "FINALIZED" || payroll.status === "PAID") {
    void queryClient.invalidateQueries({
      queryKey: payrollKeys.employeeLists(),
    });
    void queryClient.invalidateQueries({
      queryKey: payrollKeys.employeeDetail(payroll.id),
    });
  }
}

export function synchronizePayrollGeneration(queryClient: QueryClient) {
  void queryClient.invalidateQueries({
    queryKey: payrollKeys.adminLists(),
  });
}

