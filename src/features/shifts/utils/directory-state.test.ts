import { describe, expect, it } from "vitest";

import {
  parseShiftDirectoryState,
  updateShiftSearchParams,
} from "@/features/shifts/utils/directory-state";

describe("shift directory state", () => {
  it("defaults pagination, sorting, and empty filters", () => {
    const params = new URLSearchParams();
    expect(parseShiftDirectoryState(params)).toEqual({
      page: 0,
      limit: 20,
      search: "",
      status: undefined,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
  });

  it("parses valid search, status, and sort parameters", () => {
    const params = new URLSearchParams({
      page: "3",
      limit: "50",
      search: "night",
      status: "ACTIVE",
      sortBy: "startTime",
      sortDirection: "asc",
    });
    expect(parseShiftDirectoryState(params)).toEqual({
      page: 3,
      limit: 50,
      search: "night",
      status: "ACTIVE",
      sortBy: "startTime",
      sortDirection: "asc",
    });
  });

  it("sanitizes invalid numbers, unsupported fields, and illegal statuses", () => {
    const params = new URLSearchParams({
      page: "-1",
      limit: "99",
      status: "SUSPENDED",
      sortBy: "unsupportedField",
      sortDirection: "sideways",
    });
    expect(parseShiftDirectoryState(params)).toEqual({
      page: 0,
      limit: 20,
      search: "",
      status: undefined,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
  });

  it("updates and removes query parameters correctly", () => {
    const current = new URLSearchParams("page=1&status=ACTIVE&search=morning");
    const next = updateShiftSearchParams(current, {
      search: "",
      page: 0,
      sortBy: "name",
    });
    expect(next.get("search")).toBeNull();
    expect(next.get("page")).toBe("0");
    expect(next.get("status")).toBe("ACTIVE");
    expect(next.get("sortBy")).toBe("name");
  });
});

