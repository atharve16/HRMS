import { describe, expect, it } from "vitest";

import {
  parseOfficeLocationDirectoryState,
  updateOfficeLocationSearchParams,
} from "@/features/office-locations/utils/directory-state";

describe("office location directory state", () => {
  it("defaults pagination, sorting, and empty filters", () => {
    const params = new URLSearchParams();
    expect(parseOfficeLocationDirectoryState(params)).toEqual({
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
      page: "2",
      limit: "50",
      search: "central",
      status: "ACTIVE",
      sortBy: "city",
      sortDirection: "asc",
    });
    expect(parseOfficeLocationDirectoryState(params)).toEqual({
      page: 2,
      limit: 50,
      search: "central",
      status: "ACTIVE",
      sortBy: "city",
      sortDirection: "asc",
    });
  });

  it("sanitizes invalid numbers, unsupported fields, and illegal statuses", () => {
    const params = new URLSearchParams({
      page: "-5",
      limit: "37",
      status: "UNKNOWN_STATUS",
      sortBy: "invalidField",
      sortDirection: "sideways",
    });
    expect(parseOfficeLocationDirectoryState(params)).toEqual({
      page: 0,
      limit: 20,
      search: "",
      status: undefined,
      sortBy: "createdAt",
      sortDirection: "desc",
    });
  });

  it("updates and removes query parameters correctly", () => {
    const current = new URLSearchParams("page=1&status=ACTIVE&search=hq");
    const next = updateOfficeLocationSearchParams(current, {
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

