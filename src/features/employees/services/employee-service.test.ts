import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));

vi.mock("@/services/api-client", () => ({ apiClient: api }));

import {
  createEmployee,
  deactivateEmployee,
  getEmployee,
  getMyEmployeeProfile,
  listEmployees,
  reactivateEmployee,
  updateEmployee,
} from "@/features/employees/services/employee-service";

const employee = {
  id: "emp-1",
  employeeCode: "EMP-0001",
  userId: "user-1",
  firstName: "Asha",
  lastName: "Rao",
  email: "asha@example.com",
  employmentType: "FULL_TIME" as const,
  joiningDate: "2025-01-01",
  employmentStatus: "ACTIVE" as const,
};

function envelope<T>(data: T) {
  return { data: { success: true, message: "ok", data, timestamp: "2026-11-01T00:00:00Z" } };
}

beforeEach(() => {
  api.get.mockReset();
  api.post.mockReset();
  api.patch.mockReset();
});

describe("employee API service", () => {
  it("passes backend pagination and filters unchanged", async () => {
    const page = { content: [employee], page: 1, limit: 20, totalElements: 21, totalPages: 2, first: false, last: true };
    api.get.mockResolvedValue(envelope(page));
    const params = { page: 1, limit: 20, search: "Asha", employmentStatus: "ACTIVE" as const, departmentId: "dep-1" };
    await expect(listEmployees(params)).resolves.toEqual(page);
    expect(api.get).toHaveBeenCalledWith("/admin/employees", { params });
  });

  it("gets, creates, and partially updates employees", async () => {
    api.get.mockResolvedValue(envelope(employee));
    api.post.mockResolvedValue(envelope(employee));
    api.patch.mockResolvedValue(envelope({ ...employee, designation: "Engineer" }));
    await expect(getEmployee("emp-1")).resolves.toEqual(employee);
    expect(api.get).toHaveBeenCalledWith("/admin/employees/emp-1");

    const create = { firstName: "Asha", lastName: "Rao", email: "asha@example.com", employmentType: "FULL_TIME" as const, joiningDate: "2025-01-01" };
    await createEmployee(create);
    expect(api.post).toHaveBeenCalledWith("/admin/employees", create);

    await updateEmployee("emp-1", { designation: "Engineer" });
    expect(api.patch).toHaveBeenCalledWith("/admin/employees/emp-1", { designation: "Engineer" });
  });

  it("uses the dedicated lifecycle endpoints", async () => {
    api.patch.mockResolvedValue(envelope(employee));
    await deactivateEmployee("emp-1");
    expect(api.patch).toHaveBeenNthCalledWith(1, "/admin/employees/emp-1/deactivate");
    await reactivateEmployee("emp-1");
    expect(api.patch).toHaveBeenNthCalledWith(2, "/admin/employees/emp-1/reactivate");
  });

  it("loads the self profile", async () => {
    api.get.mockResolvedValueOnce(envelope(employee));
    await getMyEmployeeProfile();
    expect(api.get).toHaveBeenCalledWith("/employees/me");
  });

  it("preserves centralized API failures", async () => {
    const error = new Error("conflict");
    api.post.mockRejectedValue(error);
    await expect(createEmployee({ firstName: "A", lastName: "B", email: "a@b.com", employmentType: "INTERN", joiningDate: "2026-01-01" })).rejects.toBe(error);
  });
});
