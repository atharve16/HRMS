import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/departments/services/department-service", () => ({ listDepartments: vi.fn() }));

import { synchronizeDepartmentQueries } from "@/features/departments/hooks/department-mutation-utils";
import { departmentKeys } from "@/features/departments/hooks/department-query-keys";
import { departmentsQueryOptions } from "@/features/departments/hooks/use-departments";
import type { Department } from "@/features/departments/types/department-types";

const department: Department = { id: "dep-1", departmentCode: "ENG", name: "Engineering", status: "ACTIVE" };

describe("department query behavior", () => {
  it("includes pagination, filters, and sorting in stable list keys", () => {
    const one = departmentsQueryOptions({ page: 0, limit: 20, search: "eng", status: "ACTIVE", sortBy: "name", sortDirection: "asc" });
    const two = departmentsQueryOptions({ page: 1, limit: 20, search: "eng", status: "ACTIVE", sortBy: "name", sortDirection: "asc" });
    expect(one.queryKey).toEqual(["departments", "list", { page: 0, limit: 20, search: "eng", status: "ACTIVE", sortBy: "name", sortDirection: "asc" }]);
    expect(one.queryKey).not.toEqual(two.queryKey);
    expect(typeof one.placeholderData).toBe("function");
  });

  it("updates detail data and invalidates lists and employee selector options", () => {
    const client = new QueryClient();
    client.setQueryData(departmentKeys.list({ page: 0, limit: 20 }), { content: [] });
    client.setQueryData(departmentKeys.options(), { content: [department] });
    synchronizeDepartmentQueries(client, { ...department, name: "Platform Engineering" });
    expect(client.getQueryData(departmentKeys.detail("dep-1"))).toEqual(expect.objectContaining({ name: "Platform Engineering" }));
    expect(client.getQueryState(departmentKeys.list({ page: 0, limit: 20 }))?.isInvalidated).toBe(true);
    expect(client.getQueryState(departmentKeys.options())?.isInvalidated).toBe(true);
  });
});
