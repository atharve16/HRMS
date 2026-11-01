import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/features/employees/services/employee-service", () => ({
  listEmployees: vi.fn(),
}));

import { synchronizeEmployeeQueries } from "@/features/employees/hooks/employee-mutation-utils";
import { employeeKeys } from "@/features/employees/hooks/employee-query-keys";
import { employeesQueryOptions } from "@/features/employees/hooks/use-employees";
import type { Employee } from "@/features/employees/types/employee-types";

const employee: Employee = { id: "emp-1", employeeCode: "EMP-0001", userId: "user-1", firstName: "Asha", lastName: "Rao", email: "asha@example.com", employmentType: "FULL_TIME", joiningDate: "2025-01-01", employmentStatus: "ACTIVE" };

describe("employee query behavior", () => {
  it("makes pagination and filters part of stable list keys", () => {
    const one = employeesQueryOptions({ page: 0, limit: 20, search: "Asha" });
    const two = employeesQueryOptions({ page: 1, limit: 20, search: "Asha" });
    expect(one.queryKey).toEqual(["employees", "list", { page: 0, limit: 20, search: "Asha" }]);
    expect(one.queryKey).not.toEqual(two.queryKey);
    expect(typeof one.placeholderData).toBe("function");
  });

  it("synchronizes detail cache and invalidates dependent collections", async () => {
    const client = new QueryClient();
    client.setQueryData(employeeKeys.list({ page: 0, limit: 20 }), { content: [] });
    client.setQueryData(employeeKeys.managers(), { content: [] });
    client.setQueryData(employeeKeys.self(), employee);
    synchronizeEmployeeQueries(client, { ...employee, designation: "Engineer" });
    expect(client.getQueryData(employeeKeys.detail("emp-1"))).toEqual(expect.objectContaining({ designation: "Engineer" }));
    expect(client.getQueryState(employeeKeys.list({ page: 0, limit: 20 }))?.isInvalidated).toBe(true);
    expect(client.getQueryState(employeeKeys.managers())?.isInvalidated).toBe(true);
    expect(client.getQueryState(employeeKeys.self())?.isInvalidated).toBe(true);
    await client.cancelQueries();
  });
});
