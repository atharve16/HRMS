import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));
vi.mock("@/services/api-client", () => ({ apiClient: api }));

import {
  createWorkAssignment,
  endWorkAssignment,
  getWorkAssignment,
  listEmployeeWorkAssignments,
} from "@/features/work-assignments/services/work-assignment-service";
import type { WorkAssignment } from "@/features/work-assignments/types/work-assignment-types";
import { ApiClientError } from "@/services/api-error";

const sampleAssignment: WorkAssignment = {
  id: "6724a1b2c3d4e5f60718293a",
  employeeId: "6724a1b2c3d4e5f60718293b",
  shiftId: "6724a1b2c3d4e5f60718293c",
  officeLocationId: "6724a1b2c3d4e5f60718293d",
  effectiveFrom: "2026-11-01",
  effectiveTo: null,
  status: "ACTIVE",
  reason: "Initial assignment",
  createdAt: "2026-11-01T00:00:00Z",
  updatedAt: "2026-11-01T00:00:00Z",
};

const envelope = <T>(data: T) => ({
  data: { success: true, message: "ok", data, timestamp: "2026-11-01T00:00:00Z" },
});

beforeEach(() => {
  api.get.mockReset();
  api.post.mockReset();
  api.patch.mockReset();
});

describe("work assignment API service", () => {
  it("lists employee assignments directly from employee endpoint", async () => {
    api.get.mockResolvedValue(envelope([sampleAssignment]));

    const result = await listEmployeeWorkAssignments(sampleAssignment.employeeId);
    expect(result).toEqual([sampleAssignment]);
    expect(api.get).toHaveBeenCalledWith(
      `/admin/employees/${sampleAssignment.employeeId}/work-assignments`,
    );
  });

  it("retrieves a single work assignment by id", async () => {
    api.get.mockResolvedValue(envelope(sampleAssignment));

    const result = await getWorkAssignment(sampleAssignment.id);
    expect(result).toEqual(sampleAssignment);
    expect(api.get).toHaveBeenCalledWith(
      `/admin/work-assignments/${sampleAssignment.id}`,
    );
  });

  it("creates a work assignment for an employee", async () => {
    api.post.mockResolvedValue(envelope(sampleAssignment));

    const payload = {
      shiftId: sampleAssignment.shiftId,
      officeLocationId: sampleAssignment.officeLocationId,
      effectiveFrom: "2026-11-01",
      reason: "Initial assignment",
    };

    const result = await createWorkAssignment(sampleAssignment.employeeId, payload);
    expect(result).toEqual(sampleAssignment);
    expect(api.post).toHaveBeenCalledWith(
      `/admin/employees/${sampleAssignment.employeeId}/work-assignments`,
      payload,
    );
  });

  it("ends a work assignment with effectiveTo date", async () => {
    const endedAssignment = {
      ...sampleAssignment,
      effectiveTo: "2026-11-15",
      status: "INACTIVE" as const,
    };
    api.patch.mockResolvedValue(envelope(endedAssignment));

    const payload = {
      effectiveTo: "2026-11-15",
      reason: "Role transfer",
    };

    const result = await endWorkAssignment(sampleAssignment.id, payload);
    expect(result).toEqual(endedAssignment);
    expect(api.patch).toHaveBeenCalledWith(
      `/admin/work-assignments/${sampleAssignment.id}/end`,
      payload,
    );
  });

  it("preserves overlap and conflict errors", async () => {
    const conflict = new ApiClientError(
      "Assignment period overlaps an existing active assignment",
      { status: 409, code: "CONFLICT" },
    );
    api.post.mockRejectedValue(conflict);

    await expect(
      createWorkAssignment(sampleAssignment.employeeId, {
        shiftId: sampleAssignment.shiftId,
        officeLocationId: sampleAssignment.officeLocationId,
        effectiveFrom: "2026-11-01",
      }),
    ).rejects.toBe(conflict);
  });
});

