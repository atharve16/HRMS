import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/work-assignments/services/work-assignment-service", () => ({
  listEmployeeWorkAssignments: vi.fn(),
  getWorkAssignment: vi.fn(),
}));

import { synchronizeWorkAssignmentQueries } from "@/features/work-assignments/hooks/work-assignment-mutation-utils";
import { workAssignmentKeys } from "@/features/work-assignments/hooks/work-assignment-query-keys";
import { employeeWorkAssignmentsQueryOptions } from "@/features/work-assignments/hooks/use-employee-work-assignments";
import { workAssignmentQueryOptions } from "@/features/work-assignments/hooks/use-work-assignment";
import type { WorkAssignment } from "@/features/work-assignments/types/work-assignment-types";

const assignment: WorkAssignment = {
  id: "assign-1",
  employeeId: "emp-101",
  shiftId: "shift-1",
  officeLocationId: "office-1",
  effectiveFrom: "2026-11-01",
  effectiveTo: null,
  status: "ACTIVE",
  reason: "Primary site and shift",
  createdAt: "2026-11-01T00:00:00Z",
  updatedAt: "2026-11-01T00:00:00Z",
};

describe("work assignment query behavior", () => {
  it("constructs correct query keys and options", () => {
    const listOptions = employeeWorkAssignmentsQueryOptions("emp-101");
    expect(listOptions.queryKey).toEqual([
      "work-assignments",
      "employee",
      "emp-101",
    ]);
    expect(listOptions.enabled).toBe(true);

    const emptyListOptions = employeeWorkAssignmentsQueryOptions("");
    expect(emptyListOptions.enabled).toBe(false);

    const detailOptions = workAssignmentQueryOptions("assign-1");
    expect(detailOptions.queryKey).toEqual([
      "work-assignments",
      "detail",
      "assign-1",
    ]);
    expect(detailOptions.enabled).toBe(true);
  });

  it("updates detail cache and invalidates employee list and related queries on mutation", () => {
    const client = new QueryClient();
    client.setQueryData(workAssignmentKeys.byEmployee("emp-101"), [assignment]);
    client.setQueryData(workAssignmentKeys.byEmployee("emp-102"), []);

    const updatedAssignment = {
      ...assignment,
      effectiveTo: "2026-11-30",
      status: "INACTIVE" as const,
    };

    synchronizeWorkAssignmentQueries(client, updatedAssignment);

    expect(client.getQueryData(workAssignmentKeys.detail("assign-1"))).toEqual(
      updatedAssignment,
    );
    expect(
      client.getQueryState(workAssignmentKeys.byEmployee("emp-101"))
        ?.isInvalidated,
    ).toBe(true);
    expect(
      client.getQueryState(workAssignmentKeys.byEmployee("emp-102"))
        ?.isInvalidated,
    ).toBe(true);
  });
});

