import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import {
  synchronizeLeaveBalanceMutation,
  synchronizeLeaveMutation,
} from "@/features/leaves/hooks/leave-mutation-utils";
import { leaveKeys } from "@/features/leaves/hooks/leave-query-keys";
import type {
  LeaveBalanceResponse,
  LeaveRequestResponse,
} from "@/features/leaves/types/leave-types";

describe("leave-mutation-utils", () => {
  const sampleLeave: LeaveRequestResponse = {
    id: "leave-101",
    employeeId: "emp-201",
    employeeCode: "EMP-001",
    leaveType: "CL",
    leaveTypeName: "Casual Leave",
    startDate: "2026-11-10",
    endDate: "2026-11-12",
    totalDays: 3,
    reason: "Vacation",
    status: "PENDING",
    paid: true,
    adminRemarks: null,
    reviewedBy: null,
    reviewedAt: null,
    createdAt: "2026-11-02T10:00:00Z",
    updatedAt: "2026-11-02T10:00:00Z",
  };

  const sampleBalance: LeaveBalanceResponse = {
    id: "bal-301",
    employeeId: "emp-201",
    leaveType: "CL",
    leaveTypeName: "Casual Leave",
    year: 2026,
    allocatedDays: 14,
    usedDays: 0,
    pendingDays: 3,
    availableDays: 11,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-11-02T10:00:00Z",
  };

  it("synchronizes query cache on leave request mutation", () => {
    const queryClient = new QueryClient();
    const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    synchronizeLeaveMutation(queryClient, sampleLeave);

    expect(setQueryDataSpy).toHaveBeenCalledWith(
      leaveKeys.detail(sampleLeave.id),
      sampleLeave,
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: leaveKeys.myLists(),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: leaveKeys.myBalances(),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: leaveKeys.adminLists(),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: leaveKeys.employeeBalances(),
    });
  });

  it("synchronizes query cache on balance allocation mutation", () => {
    const queryClient = new QueryClient();
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    synchronizeLeaveBalanceMutation(queryClient, sampleBalance);

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: leaveKeys.employeeBalance(
        sampleBalance.employeeId,
        sampleBalance.year,
      ),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: leaveKeys.employeeBalances(),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: leaveKeys.myBalances(),
    });
  });
});

