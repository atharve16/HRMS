"use client";

import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { synchronizeAttendanceMutation } from "@/features/attendance/hooks/attendance-mutation-utils";
import { attendanceKeys } from "@/features/attendance/hooks/attendance-query-keys";
import {
  checkIn,
  checkOut,
  correctAttendance,
  getAdminAttendanceSummary,
  getAttendanceDetail,
  getEmployeeAttendanceHistory,
  getMyAttendance,
  getMyAttendanceHistory,
  getMyAttendanceStatus,
  listAdminAttendance,
  submitAttendanceCorrection,
  getMyAttendanceCorrections,
  cancelAttendanceCorrection,
  listAdminAttendanceCorrections,
  approveAttendanceCorrection,
  rejectAttendanceCorrection,
} from "@/features/attendance/services/attendance-service";
import type {
  AdminAttendanceParams,
  AttendanceCorrectionRequest,
  AttendanceHistoryParams,
  AttendanceSummaryParams,
  GpsRequest,
  SubmitAttendanceCorrectionRequest,
  ReviewAttendanceCorrectionRequest,
} from "@/features/attendance/types/attendance-types";

export function myTodayAttendanceQueryOptions(date: string) {
  return queryOptions({
    queryKey: attendanceKeys.myToday(date),
    queryFn: () => getMyAttendance(date),
    enabled: Boolean(date),
  });
}

export function useMyTodayAttendance(date: string) {
  return useQuery(myTodayAttendanceQueryOptions(date));
}

export function myAttendanceStatusQueryOptions() {
  return queryOptions({
    queryKey: attendanceKeys.myStatus(),
    queryFn: getMyAttendanceStatus,
    refetchInterval: 60_000,
  });
}

export function useMyAttendanceStatus() {
  return useQuery(myAttendanceStatusQueryOptions());
}

export function myAttendanceHistoryQueryOptions(params?: AttendanceHistoryParams) {
  return queryOptions({
    queryKey: attendanceKeys.myHistory(params),
    queryFn: () => getMyAttendanceHistory(params),
    placeholderData: (previous) => previous,
  });
}

export function useMyAttendanceHistory(params?: AttendanceHistoryParams) {
  return useQuery(myAttendanceHistoryQueryOptions(params));
}

export function adminAttendanceQueryOptions(params?: AdminAttendanceParams) {
  return queryOptions({
    queryKey: attendanceKeys.adminList(params),
    queryFn: () => listAdminAttendance(params),
    placeholderData: (previous) => previous,
  });
}

export function useAdminAttendance(params?: AdminAttendanceParams) {
  return useQuery(adminAttendanceQueryOptions(params));
}

export function adminAttendanceSummaryQueryOptions(params?: AttendanceSummaryParams) {
  return queryOptions({
    queryKey: attendanceKeys.adminSummary(params),
    queryFn: () => getAdminAttendanceSummary(params),
  });
}

export function useAdminAttendanceSummary(params?: AttendanceSummaryParams) {
  return useQuery(adminAttendanceSummaryQueryOptions(params));
}

export function attendanceDetailQueryOptions(attendanceId: string) {
  return queryOptions({
    queryKey: attendanceKeys.detail(attendanceId),
    queryFn: () => getAttendanceDetail(attendanceId),
    enabled: Boolean(attendanceId),
  });
}

export function useAttendanceDetail(attendanceId: string) {
  return useQuery(attendanceDetailQueryOptions(attendanceId));
}

export function employeeAttendanceQueryOptions(
  employeeId: string,
  params?: AttendanceHistoryParams,
) {
  return queryOptions({
    queryKey: attendanceKeys.employeeHistory(employeeId, params),
    queryFn: () => getEmployeeAttendanceHistory(employeeId, params),
    enabled: Boolean(employeeId),
    placeholderData: (previous) => previous,
  });
}

export function useEmployeeAttendance(
  employeeId: string,
  params?: AttendanceHistoryParams,
) {
  return useQuery(employeeAttendanceQueryOptions(employeeId, params));
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: GpsRequest) => checkIn(request),
    onSuccess: (attendance) => {
      synchronizeAttendanceMutation(queryClient, attendance);
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: GpsRequest) => checkOut(request),
    onSuccess: (attendance) => {
      synchronizeAttendanceMutation(queryClient, attendance);
    },
  });
}

export function useCorrectAttendance(attendanceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AttendanceCorrectionRequest) =>
      correctAttendance(attendanceId, request),
    onSuccess: (attendance) => {
      synchronizeAttendanceMutation(queryClient, attendance);
    },
  });
}

export function useMyAttendanceCorrections() {
  return useQuery({ queryKey: attendanceKeys.myCorrections(), queryFn: getMyAttendanceCorrections });
}

export function useSubmitAttendanceCorrection() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (request: SubmitAttendanceCorrectionRequest) => submitAttendanceCorrection(request), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: attendanceKeys.myCorrections() }); } });
}

export function useCancelAttendanceCorrection() {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: string) => cancelAttendanceCorrection(id), onSuccess: () => { void queryClient.invalidateQueries({ queryKey: attendanceKeys.myCorrections() }); } });
}

export function useAdminAttendanceCorrections(params?: { employeeId?: string; departmentId?: string; fromDate?: string; toDate?: string; status?: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"; page?: number; limit?: number }) {
  return useQuery({ queryKey: attendanceKeys.adminCorrections(params), queryFn: () => listAdminAttendanceCorrections(params), placeholderData: (previous) => previous });
}

export function useReviewAttendanceCorrection(action: "approve" | "reject") {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, request }: { id: string; request?: ReviewAttendanceCorrectionRequest }) => action === "approve" ? approveAttendanceCorrection(id, request) : rejectAttendanceCorrection(id, request), onSuccess: (data) => { void queryClient.invalidateQueries({ queryKey: attendanceKeys.corrections() }); if (data.existingAttendance) synchronizeAttendanceMutation(queryClient, data.existingAttendance); } });
}

