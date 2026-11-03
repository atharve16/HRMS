"use client";

import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  synchronizePayrollGeneration,
  synchronizePayrollMutation,
  synchronizeSalaryMutation,
} from "@/features/payroll/hooks/payroll-mutation-utils";
import { payrollKeys } from "@/features/payroll/hooks/payroll-query-keys";
import {
  finalizePayroll,
  generatePayroll,
  getAdminPayrollDetail,
  getEmployeePayrollDetail,
  getEmployeeSalary,
  getEmployeeSalaryHistory,
  getMyPayrolls,
  listAdminPayrolls,
  payPayroll,
  reviewPayroll,
  updateDraftPayroll,
  upsertEmployeeSalary,
} from "@/features/payroll/services/payroll-service";
import type {
  AdminPayrollParams,
  EmployeePayrollParams,
  GeneratePayrollRequest,
  UpdateDraftPayrollRequest,
  UpsertSalaryRequest,
} from "@/features/payroll/types/payroll-types";

export function adminPayrollsQueryOptions(params?: AdminPayrollParams) {
  return queryOptions({
    queryKey: payrollKeys.adminList(params),
    queryFn: () => listAdminPayrolls(params),
    placeholderData: (previous) => previous,
  });
}

export function useAdminPayrolls(params?: AdminPayrollParams) {
  return useQuery(adminPayrollsQueryOptions(params));
}

export function adminPayrollDetailQueryOptions(payrollId: string) {
  return queryOptions({
    queryKey: payrollKeys.detail(payrollId),
    queryFn: () => getAdminPayrollDetail(payrollId),
    enabled: Boolean(payrollId),
  });
}

export function useAdminPayrollDetail(payrollId: string) {
  return useQuery(adminPayrollDetailQueryOptions(payrollId));
}

export function employeePayrollsQueryOptions(params?: EmployeePayrollParams) {
  return queryOptions({
    queryKey: payrollKeys.employeeList(params),
    queryFn: () => getMyPayrolls(params),
    placeholderData: (previous) => previous,
  });
}

export function useEmployeePayrolls(params?: EmployeePayrollParams) {
  return useQuery(employeePayrollsQueryOptions(params));
}

export function employeePayrollDetailQueryOptions(payrollId: string) {
  return queryOptions({
    queryKey: payrollKeys.employeeDetail(payrollId),
    queryFn: () => getEmployeePayrollDetail(payrollId),
    enabled: Boolean(payrollId),
  });
}

export function useEmployeePayrollDetail(payrollId: string) {
  return useQuery(employeePayrollDetailQueryOptions(payrollId));
}

export function employeeSalaryQueryOptions(employeeId: string) {
  return queryOptions({
    queryKey: payrollKeys.salary(employeeId),
    queryFn: () => getEmployeeSalary(employeeId),
    enabled: Boolean(employeeId),
  });
}

export function useEmployeeSalary(employeeId: string) {
  return useQuery(employeeSalaryQueryOptions(employeeId));
}

export function employeeSalaryHistoryQueryOptions(employeeId: string) {
  return queryOptions({
    queryKey: payrollKeys.salaryHistory(employeeId),
    queryFn: () => getEmployeeSalaryHistory(employeeId),
    enabled: Boolean(employeeId),
  });
}

export function useEmployeeSalaryHistory(employeeId: string) {
  return useQuery(employeeSalaryHistoryQueryOptions(employeeId));
}

export function useGeneratePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: GeneratePayrollRequest) => generatePayroll(payload),
    onSuccess: () => {
      synchronizePayrollGeneration(queryClient);
    },
  });
}

export function useUpdateDraftPayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      payrollId,
      payload,
    }: {
      payrollId: string;
      payload: UpdateDraftPayrollRequest;
    }) => updateDraftPayroll(payrollId, payload),
    onSuccess: (data) => {
      synchronizePayrollMutation(queryClient, data);
    },
  });
}

export function useReviewPayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payrollId: string) => reviewPayroll(payrollId),
    onSuccess: (data) => {
      synchronizePayrollMutation(queryClient, data);
    },
  });
}

export function useFinalizePayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payrollId: string) => finalizePayroll(payrollId),
    onSuccess: (data) => {
      synchronizePayrollMutation(queryClient, data);
    },
  });
}

export function usePayPayroll() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payrollId: string) => payPayroll(payrollId),
    onSuccess: (data) => {
      synchronizePayrollMutation(queryClient, data);
    },
  });
}

export function useUpsertEmployeeSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      employeeId,
      payload,
    }: {
      employeeId: string;
      payload: UpsertSalaryRequest;
    }) => upsertEmployeeSalary(employeeId, payload),
    onSuccess: (data) => {
      synchronizeSalaryMutation(queryClient, data);
    },
  });
}

