"use client";

import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { synchronizeHolidayMutation } from "@/features/holidays/hooks/holiday-mutation-utils";
import { holidayKeys } from "@/features/holidays/hooks/holiday-query-keys";
import {
  createHoliday,
  deactivateHoliday,
  getHolidayDetail,
  getUpcomingHolidays,
  listAdminHolidays,
  listEmployeeHolidays,
  updateHoliday,
} from "@/features/holidays/services/holiday-service";
import type {
  CreateHolidayRequest,
  EmployeeHolidayParams,
  HolidaySearchParams,
  UpdateHolidayRequest,
} from "@/features/holidays/types/holiday-types";

export function adminHolidaysQueryOptions(params?: HolidaySearchParams) {
  return queryOptions({
    queryKey: holidayKeys.adminList(params),
    queryFn: () => listAdminHolidays(params),
    placeholderData: (previous) => previous,
  });
}

export function useAdminHolidays(params?: HolidaySearchParams) {
  return useQuery(adminHolidaysQueryOptions(params));
}

export function holidayDetailQueryOptions(holidayId: string) {
  return queryOptions({
    queryKey: holidayKeys.detail(holidayId),
    queryFn: () => getHolidayDetail(holidayId),
    enabled: Boolean(holidayId),
  });
}

export function useHolidayDetail(holidayId: string) {
  return useQuery(holidayDetailQueryOptions(holidayId));
}

export function employeeHolidaysQueryOptions(params?: EmployeeHolidayParams) {
  return queryOptions({
    queryKey: holidayKeys.employeeList(params),
    queryFn: () => listEmployeeHolidays(params),
  });
}

export function useEmployeeHolidays(params?: EmployeeHolidayParams) {
  return useQuery(employeeHolidaysQueryOptions(params));
}

export function upcomingHolidaysQueryOptions() {
  return queryOptions({
    queryKey: holidayKeys.employeeUpcoming(),
    queryFn: () => getUpcomingHolidays(),
  });
}

export function useUpcomingHolidays() {
  return useQuery(upcomingHolidaysQueryOptions());
}

export function useCreateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (request: CreateHolidayRequest) => createHoliday(request),
    onSuccess: (data) => {
      synchronizeHolidayMutation(queryClient, data);
    },
  });
}

export function useUpdateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      holidayId,
      request,
    }: {
      holidayId: string;
      request: UpdateHolidayRequest;
    }) => updateHoliday(holidayId, request),
    onSuccess: (data) => {
      synchronizeHolidayMutation(queryClient, data);
    },
  });
}

export function useDeactivateHoliday() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (holidayId: string) => deactivateHoliday(holidayId),
    onSuccess: (data) => {
      synchronizeHolidayMutation(queryClient, data);
    },
  });
}

