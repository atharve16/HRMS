import { describe, expect, it } from "vitest";

import { parseEmployeeDirectoryState, updateDirectorySearchParams } from "@/features/employees/utils/directory-state";

describe("employee directory URL state", () => {
  it("parses valid zero-based pagination and filters", () => {
    const params = new URLSearchParams("page=2&limit=50&search=%20asha%20&status=ACTIVE&department=dep-1");
    expect(parseEmployeeDirectoryState(params)).toEqual({ page: 2, limit: 50, search: "asha", employmentStatus: "ACTIVE", departmentId: "dep-1" });
  });

  it("falls back safely for unsupported values", () => {
    const params = new URLSearchParams("page=-1&limit=500&status=UNKNOWN");
    expect(parseEmployeeDirectoryState(params)).toEqual({ page: 0, limit: 20, search: "", employmentStatus: undefined, departmentId: undefined });
  });

  it("preserves unrelated filters and removes reset values", () => {
    const next = updateDirectorySearchParams(new URLSearchParams("page=3&status=ACTIVE"), { page: 0, search: "Rao", status: undefined });
    expect(next.toString()).toBe("page=0&search=Rao");
  });
});
