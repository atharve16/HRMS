import { describe, expect, it } from "vitest";

import { parseDepartmentDirectoryState, updateDepartmentSearchParams } from "@/features/departments/utils/directory-state";

describe("department directory URL state", () => {
  it("parses valid zero-based pagination, filters, and sorting", () => {
    const params = new URLSearchParams("page=2&limit=50&search=%20eng%20&status=ACTIVE&sortBy=name&sortDirection=asc");
    expect(parseDepartmentDirectoryState(params)).toEqual({ page: 2, limit: 50, search: "eng", status: "ACTIVE", sortBy: "name", sortDirection: "asc" });
  });

  it("falls back for unsupported values", () => {
    const params = new URLSearchParams("page=-2&limit=500&status=UNKNOWN&sortBy=employeeCount&sortDirection=sideways");
    expect(parseDepartmentDirectoryState(params)).toEqual({ page: 0, limit: 20, search: "", status: undefined, sortBy: "createdAt", sortDirection: "desc" });
  });

  it("preserves unrelated state and removes cleared filters", () => {
    const next = updateDepartmentSearchParams(new URLSearchParams("page=3&status=ACTIVE&sortBy=name"), { page: 0, search: "Design", status: undefined });
    expect(next.toString()).toBe("page=0&sortBy=name&search=Design");
  });
});
