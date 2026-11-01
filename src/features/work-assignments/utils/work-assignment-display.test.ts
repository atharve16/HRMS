import { describe, expect, it } from "vitest";

import type { WorkAssignment } from "@/features/work-assignments/types/work-assignment-types";
import {
  formatAssignmentDate,
  formatEffectiveRange,
  isAssignmentCurrentlyActive,
  sortAssignmentsChronological,
} from "@/features/work-assignments/utils/work-assignment-display";

const baseAssignment: WorkAssignment = {
  id: "a-1",
  employeeId: "e-1",
  shiftId: "s-1",
  officeLocationId: "o-1",
  effectiveFrom: "2026-11-01",
  effectiveTo: null,
  status: "ACTIVE",
  reason: null,
  createdAt: "2026-11-01T00:00:00Z",
  updatedAt: "2026-11-01T00:00:00Z",
};

describe("work assignment display utils", () => {
  it("formats dates and ranges safely", () => {
    expect(formatAssignmentDate("2026-11-01")).toBe("Nov 1, 2026");
    expect(formatAssignmentDate(null)).toBe("Indefinite");
    expect(formatAssignmentDate(undefined, "None")).toBe("None");

    expect(formatEffectiveRange("2026-11-01", null)).toBe(
      "Nov 1, 2026 – Present",
    );
    expect(formatEffectiveRange("2026-11-01", "2026-12-15")).toBe(
      "Nov 1, 2026 – Dec 15, 2026",
    );
  });

  it("sorts assignments by effectiveFrom descending", () => {
    const older: WorkAssignment = {
      ...baseAssignment,
      id: "a-old",
      effectiveFrom: "2026-01-01",
    };
    const newer: WorkAssignment = {
      ...baseAssignment,
      id: "a-new",
      effectiveFrom: "2026-06-01",
    };
    const newest: WorkAssignment = {
      ...baseAssignment,
      id: "a-newest",
      effectiveFrom: "2026-11-01",
    };

    const sorted = sortAssignmentsChronological([older, newest, newer]);
    expect(sorted.map((item) => item.id)).toEqual(["a-newest", "a-new", "a-old"]);
  });

  it("evaluates active status considering reference date", () => {
    // Current active indefinite assignment
    expect(isAssignmentCurrentlyActive(baseAssignment, "2026-11-02")).toBe(true);

    // Inactive status flag
    expect(
      isAssignmentCurrentlyActive(
        { ...baseAssignment, status: "INACTIVE" },
        "2026-11-02",
      ),
    ).toBe(false);

    // Future effectiveFrom
    expect(isAssignmentCurrentlyActive(baseAssignment, "2026-10-15")).toBe(false);

    // Past effectiveTo
    expect(
      isAssignmentCurrentlyActive(
        { ...baseAssignment, effectiveTo: "2026-11-01" },
        "2026-11-02",
      ),
    ).toBe(false);
  });
});

