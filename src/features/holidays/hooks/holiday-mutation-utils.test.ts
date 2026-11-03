import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

import { synchronizeHolidayMutation } from "@/features/holidays/hooks/holiday-mutation-utils";
import { holidayKeys } from "@/features/holidays/hooks/holiday-query-keys";
import type { AdminHolidayResponse } from "@/features/holidays/types/holiday-types";

describe("holiday-mutation-utils", () => {
  const sampleHoliday: AdminHolidayResponse = {
    id: "hol-101",
    name: "Labor Day",
    description: "International Workers' Day",
    date: "2026-05-01",
    active: true,
    createdBy: "usr-admin",
    updatedBy: "usr-admin",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  };

  it("synchronizes query cache on holiday mutation", () => {
    const queryClient = new QueryClient();
    const setQueryDataSpy = vi.spyOn(queryClient, "setQueryData");
    const invalidateQueriesSpy = vi.spyOn(queryClient, "invalidateQueries");

    synchronizeHolidayMutation(queryClient, sampleHoliday);

    expect(setQueryDataSpy).toHaveBeenCalledWith(
      holidayKeys.detail(sampleHoliday.id),
      sampleHoliday,
    );
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: holidayKeys.adminLists(),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: holidayKeys.employeeLists(),
    });
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: holidayKeys.employeeUpcoming(),
    });
  });
});

