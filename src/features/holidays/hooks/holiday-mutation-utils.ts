import type { QueryClient } from "@tanstack/react-query";

import { holidayKeys } from "@/features/holidays/hooks/holiday-query-keys";
import type { AdminHolidayResponse } from "@/features/holidays/types/holiday-types";

export function synchronizeHolidayMutation(
  queryClient: QueryClient,
  holiday: AdminHolidayResponse,
) {
  queryClient.setQueryData(holidayKeys.detail(holiday.id), holiday);

  // Invalidate admin lists
  void queryClient.invalidateQueries({
    queryKey: holidayKeys.adminLists(),
  });

  // Invalidate employee lists and upcoming holidays
  void queryClient.invalidateQueries({
    queryKey: holidayKeys.employeeLists(),
  });
  void queryClient.invalidateQueries({
    queryKey: holidayKeys.employeeUpcoming(),
  });
}

