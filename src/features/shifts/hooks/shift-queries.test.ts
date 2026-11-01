import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/shifts/services/shift-service", () => ({
  listShifts: vi.fn(),
}));

import { synchronizeShiftQueries } from "@/features/shifts/hooks/shift-mutation-utils";
import { shiftKeys } from "@/features/shifts/hooks/shift-query-keys";
import { shiftsQueryOptions } from "@/features/shifts/hooks/use-shifts";
import type { Shift } from "@/features/shifts/types/shift-types";

const shift: Shift = {
  id: "shift-1",
  shiftCode: "DAY-1",
  name: "Day Shift",
  startTime: "09:00:00",
  endTime: "17:00:00",
  workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  gracePeriodMinutes: 15,
  earlyDepartureGraceMinutes: 10,
  expectedBreakMinutes: 60,
  flexible: false,
  status: "ACTIVE",
};

describe("shift query behavior", () => {
  it("includes pagination, filters, and sorting in stable list keys", () => {
    const one = shiftsQueryOptions({
      page: 0,
      limit: 20,
      search: "DAY",
      status: "ACTIVE",
      sortBy: "name",
      sortDirection: "asc",
    });
    const two = shiftsQueryOptions({
      page: 1,
      limit: 20,
      search: "DAY",
      status: "ACTIVE",
      sortBy: "name",
      sortDirection: "asc",
    });
    expect(one.queryKey).toEqual([
      "shifts",
      "list",
      {
        page: 0,
        limit: 20,
        search: "DAY",
        status: "ACTIVE",
        sortBy: "name",
        sortDirection: "asc",
      },
    ]);
    expect(one.queryKey).not.toEqual(two.queryKey);
    expect(typeof one.placeholderData).toBe("function");
  });

  it("updates detail data and invalidates lists and options", () => {
    const client = new QueryClient();
    client.setQueryData(shiftKeys.list({ page: 0, limit: 20 }), {
      content: [],
    });
    client.setQueryData(shiftKeys.options(), { content: [shift] });

    synchronizeShiftQueries(client, { ...shift, name: "Morning Shift" });

    expect(client.getQueryData(shiftKeys.detail("shift-1"))).toEqual(
      expect.objectContaining({ name: "Morning Shift" }),
    );
    expect(
      client.getQueryState(shiftKeys.list({ page: 0, limit: 20 }))
        ?.isInvalidated,
    ).toBe(true);
    expect(client.getQueryState(shiftKeys.options())?.isInvalidated).toBe(true);
  });
});

