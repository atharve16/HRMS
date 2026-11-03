import type { QueryClient } from "@tanstack/react-query";

import { attendanceKeys } from "@/features/attendance/hooks/attendance-query-keys";
import type { AttendanceResponse } from "@/features/attendance/types/attendance-types";

export function synchronizeAttendanceMutation(
  queryClient: QueryClient,
  attendance: AttendanceResponse,
) {
  queryClient.setQueryData(attendanceKeys.detail(attendance.id), attendance);

  // Invalidate employee personal queries
  void queryClient.invalidateQueries({
    queryKey: attendanceKeys.myToday(attendance.workDate),
  });
  void queryClient.invalidateQueries({
    queryKey: attendanceKeys.myStatus(),
  });
  void queryClient.invalidateQueries({
    queryKey: attendanceKeys.myHistories(),
  });

  // Invalidate admin directory, summary, and employee-specific history
  void queryClient.invalidateQueries({
    queryKey: attendanceKeys.adminLists(),
  });
  void queryClient.invalidateQueries({
    queryKey: attendanceKeys.adminSummaries(),
  });
  void queryClient.invalidateQueries({
    queryKey: attendanceKeys.employeeHistories(),
  });
}

