import type { QueryClient } from "@tanstack/react-query";

import { leaveKeys } from "@/features/leaves/hooks/leave-query-keys";
import type {
  LeaveBalanceResponse,
  LeaveRequestResponse,
} from "@/features/leaves/types/leave-types";

export function synchronizeLeaveMutation(
  queryClient: QueryClient,
  leave: LeaveRequestResponse,
) {
  queryClient.setQueryData(leaveKeys.detail(leave.id), leave);

  // Invalidate employee personal queries
  void queryClient.invalidateQueries({
    queryKey: leaveKeys.myLists(),
  });
  void queryClient.invalidateQueries({
    queryKey: leaveKeys.myBalances(),
  });

  // Invalidate admin directories and employee balance lists
  void queryClient.invalidateQueries({
    queryKey: leaveKeys.adminLists(),
  });
  void queryClient.invalidateQueries({
    queryKey: leaveKeys.employeeBalances(),
  });
}

export function synchronizeLeaveBalanceMutation(
  queryClient: QueryClient,
  balance: LeaveBalanceResponse,
) {
  // Invalidate both admin and employee balance caches
  void queryClient.invalidateQueries({
    queryKey: leaveKeys.employeeBalance(balance.employeeId, balance.year),
  });
  void queryClient.invalidateQueries({
    queryKey: leaveKeys.employeeBalances(),
  });
  void queryClient.invalidateQueries({
    queryKey: leaveKeys.myBalances(),
  });
}

