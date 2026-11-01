import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn() }));
vi.mock("@/services/api-client", () => ({ apiClient: api }));

import {
  createDepartment,
  deactivateDepartment,
  getDepartment,
  listDepartmentOptions,
  listDepartments,
  reactivateDepartment,
  updateDepartment,
} from "@/features/departments/services/department-service";
import { ApiClientError } from "@/services/api-error";

const department = { id: "507f1f77bcf86cd799439011", departmentCode: "ENG", name: "Engineering", description: "Builds products", status: "ACTIVE" as const };
const envelope = <T,>(data: T) => ({ data: { success: true, message: "ok", data, timestamp: "2026-11-01T00:00:00Z" } });

beforeEach(() => { api.get.mockReset(); api.post.mockReset(); api.patch.mockReset(); });

describe("department API service", () => {
  it("passes pagination, search, status, and sorting unchanged", async () => {
    const page = { content: [department], page: 1, limit: 20, totalElements: 21, totalPages: 2, first: false, last: true };
    api.get.mockResolvedValue(envelope(page));
    const params = { page: 1, limit: 20, search: "eng", status: "ACTIVE" as const, sortBy: "name" as const, sortDirection: "asc" as const };
    await expect(listDepartments(params)).resolves.toEqual(page);
    expect(api.get).toHaveBeenCalledWith("/admin/departments", { params });
  });

  it("loads a bounded, alphabetized reference list", async () => {
    api.get.mockResolvedValue(envelope({ content: [], page: 0, limit: 100, totalElements: 0, totalPages: 0, first: true, last: true }));
    await listDepartmentOptions();
    expect(api.get).toHaveBeenCalledWith("/admin/departments", { params: { page: 0, limit: 100, sortBy: "name", sortDirection: "asc" } });
  });

  it("gets, creates, and partially updates a department", async () => {
    api.get.mockResolvedValue(envelope(department));
    api.post.mockResolvedValue(envelope(department));
    api.patch.mockResolvedValue(envelope({ ...department, name: "Platform Engineering" }));
    await expect(getDepartment(department.id)).resolves.toEqual(department);
    expect(api.get).toHaveBeenCalledWith(`/admin/departments/${department.id}`);
    const create = { departmentCode: "ENG", name: "Engineering" };
    await createDepartment(create);
    expect(api.post).toHaveBeenCalledWith("/admin/departments", create);
    await updateDepartment(department.id, { name: "Platform Engineering" });
    expect(api.patch).toHaveBeenCalledWith(`/admin/departments/${department.id}`, { name: "Platform Engineering" });
  });

  it("uses the dedicated lifecycle endpoints", async () => {
    api.patch.mockResolvedValue(envelope(department));
    await deactivateDepartment(department.id);
    expect(api.patch).toHaveBeenNthCalledWith(1, `/admin/departments/${department.id}/deactivate`);
    await reactivateDepartment(department.id);
    expect(api.patch).toHaveBeenNthCalledWith(2, `/admin/departments/${department.id}/reactivate`);
  });

  it("preserves duplicate and safeguard conflicts", async () => {
    const conflict = new ApiClientError("Department code or name already exists", { status: 409, code: "CONFLICT" });
    api.post.mockRejectedValue(conflict);
    await expect(createDepartment({ departmentCode: "ENG", name: "Engineering" })).rejects.toBe(conflict);
    api.patch.mockRejectedValue(new ApiClientError("Reassign active employees before deactivating this department", { status: 409, code: "CONFLICT" }));
    await expect(deactivateDepartment(department.id)).rejects.toMatchObject({ code: "CONFLICT" });
  });
});
