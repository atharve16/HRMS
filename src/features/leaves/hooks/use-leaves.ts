"use client";

import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  synchronizeLeaveBalanceMutation,
  synchronizeLeaveMutation,
} from "@/features/leaves/hooks/leave-mutation-utils";
import { leaveKeys } from "@/features/leaves/hooks/leave-query-keys";
import {
  allocateEmployeeLeaveBalance,
  allocateMonthlyLeave,
  applyLeave,
  approveLeave,
  cancelLeave,
  getEmployeeLeaveBalances,
  getLeaveDetail,
  getMyLeaveBalances,
  getMyMonthlyLeaveBalances,
  getEmployeeMonthlyLeaveBalances,
  getEmployeeLeaveAllocationHistory,
  getLeaveDashboard,
  saveCompanyLeavePolicy,
  saveEmployeeLeavePolicy,
  getMyLeaves,
  listAdminLeaves,
  rejectLeave,
} from "@/features/leaves/services/leave-service";
import type {
  AllocateLeaveBalanceRequest,
  ApplyLeaveRequest,
  EmployeeLeaveParams,
  LeaveSearchParams,
  RejectLeaveRequest,
  LeaveAllocationRequest,
} from "@/features/leaves/types/leave-types";

export function myLeavesQueryOptions(params?: EmployeeLeaveParams) {
  return queryOptions({
    queryKey: leaveKeys.myList(params),
    queryFn: () => getMyLeaves(params),
    placeholderData: (previous) => previous,
  });
}

export function useMyLeaves(params?: EmployeeLeaveParams) {
  return useQuery(myLeavesQueryOptions(params));
}

export function myLeaveBalancesQueryOptions(year?: number) {
  return queryOptions({
    queryKey: leaveKeys.myBalance(year),
    queryFn: () => getMyLeaveBalances(year),
  });
}

export function useMyLeaveBalances(year?: number) {
  return useQuery(myLeaveBalancesQueryOptions(year));
}

export function useMyMonthlyLeaveBalances(month: string) {
  return useQuery({ queryKey: leaveKeys.monthlyBalance(month), queryFn: () => getMyMonthlyLeaveBalances(month), enabled: Boolean(month) });
}

export function useEmployeeMonthlyLeaveBalances(employeeId: string, month: string) {
  return useQuery({ queryKey: leaveKeys.allocationBalance(employeeId, month), queryFn: () => getEmployeeMonthlyLeaveBalances(employeeId, month), enabled: Boolean(employeeId && month) });
}

export function useEmployeeLeaveAllocationHistory(employeeId: string, month: string) {
  return useQuery({ queryKey: leaveKeys.allocationHistory(employeeId, month), queryFn: () => getEmployeeLeaveAllocationHistory(employeeId, month), enabled: Boolean(employeeId && month) });
}

export function useLeaveDashboard(month: string) {
  return useQuery({ queryKey: leaveKeys.dashboard(month), queryFn: () => getLeaveDashboard(month), enabled: Boolean(month) });
}

export function useAllocateMonthlyLeave() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ employeeId, request }: { employeeId: string; request: LeaveAllocationRequest }) => allocateMonthlyLeave(employeeId, request), onSuccess: (data) => {
    void queryClient.invalidateQueries({ queryKey: leaveKeys.allocationBalance(data.employeeId, data.period) });
    void queryClient.invalidateQueries({ queryKey: leaveKeys.allocationHistory(data.employeeId, data.period) });
    void queryClient.invalidateQueries({ queryKey: leaveKeys.dashboard(data.period) });
    void queryClient.invalidateQueries({ queryKey: leaveKeys.monthlyBalance(data.period) });
  }});
}

export function useSaveLeavePolicy() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ employeeId, request }: { employeeId?: string; request: import("@/features/leaves/types/leave-types").LeavePolicyRequest }) => employeeId ? saveEmployeeLeavePolicy(employeeId, request) : saveCompanyLeavePolicy(request), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: leaveKeys.allocation() }); void queryClient.invalidateQueries({ queryKey: leaveKeys.monthly() }); } });
}

export function adminLeavesQueryOptions(params?: LeaveSearchParams) {
  return queryOptions({
    queryKey: leaveKeys.adminList(params),
    queryFn: () => listAdminLeaves(params),
    placeholderData: (previous) => previous,
  });
}

export function useAdminLeaves(params?: LeaveSearchParams) {
  return useQuery(adminLeavesQueryOptions(params));
}

export function leaveDetailQueryOptions(leaveId: string) {
  return queryOptions({
    queryKey: leaveKeys.detail(leaveId),
    queryFn: () => getLeaveDetail(leaveId),
    enabled: Boolean(leaveId),
  });
}

export function useLeaveDetail(leaveId: string) {
  return useQuery(leaveDetailQueryOptions(leaveId));
}

export function employeeLeaveBalancesQueryOptions(
  employeeId: string,
  year?: number,
) {
  return queryOptions({
    queryKey: leaveKeys.employeeBalance(employeeId, year),
    queryFn: () => getEmployeeLeaveBalances(employeeId, year),
    enabled: Boolean(employeeId),
  });
}

export function useEmployeeLeaveBalances(employeeId: string, year?: number) {
  return useQuery(employeeLeaveBalancesQueryOptions(employeeId, year));
}

export function useApplyLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: ApplyLeaveRequest) => applyLeave(request),
    onSuccess: (data) => {
      synchronizeLeaveMutation(queryClient, data);
    },
  });
}

export function useCancelLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leaveId: string) => cancelLeave(leaveId),
    onSuccess: (data) => {
      synchronizeLeaveMutation(queryClient, data);
    },
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (leaveId: string) => approveLeave(leaveId),
    onSuccess: (data) => {
      synchronizeLeaveMutation(queryClient, data);
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      leaveId,
      request,
    }: {
      leaveId: string;
      request: RejectLeaveRequest;
    }) => rejectLeave(leaveId, request),
    onSuccess: (data) => {
      synchronizeLeaveMutation(queryClient, data);
    },
  });
}

export function useAllocateLeaveBalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      employeeId,
      request,
    }: {
      employeeId: string;
      request: AllocateLeaveBalanceRequest;
    }) => allocateEmployeeLeaveBalance(employeeId, request),
    onSuccess: (data) => {
      synchronizeLeaveBalanceMutation(queryClient, data);
    },
  });
}

