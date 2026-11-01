import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn() }));
vi.mock("@/services/api-client", () => ({ apiClient: api }));

import {
  createShift,
  deactivateShift,
  getShift,
  listShiftOptions,
  listShifts,
  reactivateShift,
  updateShift,
} from "@/features/shifts/services/shift-service";
import type { DayOfWeek, Shift } from "@/features/shifts/types/shift-types";
import { ApiClientError } from "@/services/api-error";

const shift: Shift = {
  id: "6724a1b2c3d4e5f60718293b",
  shiftCode: "GEN-01",
  name: "General Day Shift",
  description: "Standard daytime shift",
  startTime: "09:00:00",
  endTime: "17:00:00",
  workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  gracePeriodMinutes: 15,
  earlyDepartureGraceMinutes: 10,
  expectedBreakMinutes: 60,
  minimumBreakMinutes: 30,
  flexible: false,
  status: "ACTIVE",
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

describe("shift API service", () => {
  it("passes pagination, search, status, and sorting unchanged", async () => {
    const page = {
      content: [shift],
      page: 0,
      limit: 20,
      totalElements: 1,
      totalPages: 1,
      first: true,
      last: true,
    };
    api.get.mockResolvedValue(envelope(page));
    const params = {
      page: 0,
      limit: 20,
      search: "GEN",
      status: "ACTIVE" as const,
      sortBy: "name" as const,
      sortDirection: "asc" as const,
    };
    await expect(listShifts(params)).resolves.toEqual(page);
    expect(api.get).toHaveBeenCalledWith("/admin/shifts", { params });
  });

  it("loads bounded, alphabetized reference options", async () => {
    api.get.mockResolvedValue(
      envelope({
        content: [],
        page: 0,
        limit: 100,
        totalElements: 0,
        totalPages: 0,
        first: true,
        last: true,
      }),
    );
    await listShiftOptions();
    expect(api.get).toHaveBeenCalledWith("/admin/shifts", {
      params: { page: 0, limit: 100, sortBy: "name", sortDirection: "asc" },
    });
  });

  it("gets, creates, and partially updates a shift", async () => {
    api.get.mockResolvedValue(envelope(shift));
    api.post.mockResolvedValue(envelope(shift));
    api.patch.mockResolvedValue(envelope({ ...shift, name: "Core Business Shift" }));

    await expect(getShift(shift.id)).resolves.toEqual(shift);
    expect(api.get).toHaveBeenCalledWith(`/admin/shifts/${shift.id}`);

    const createPayload = {
      shiftCode: "GEN-01",
      name: "General Day Shift",
      startTime: "09:00",
      endTime: "17:00",
      workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"] as DayOfWeek[],
      gracePeriodMinutes: 15,
      earlyDepartureGraceMinutes: 10,
      expectedBreakMinutes: 60,
      minimumBreakMinutes: 30,
      flexible: false,
    };
    await createShift(createPayload);
    expect(api.post).toHaveBeenCalledWith("/admin/shifts", createPayload);

    await updateShift(shift.id, { name: "Core Business Shift" });
    expect(api.patch).toHaveBeenCalledWith(`/admin/shifts/${shift.id}`, {
      name: "Core Business Shift",
    });
  });

  it("uses the dedicated lifecycle endpoints", async () => {
    api.patch.mockResolvedValue(envelope(shift));
    await deactivateShift(shift.id);
    expect(api.patch).toHaveBeenNthCalledWith(
      1,
      `/admin/shifts/${shift.id}/deactivate`,
    );

    await reactivateShift(shift.id);
    expect(api.patch).toHaveBeenNthCalledWith(
      2,
      `/admin/shifts/${shift.id}/reactivate`,
    );
  });

  it("preserves duplicate and assignment safeguard conflicts", async () => {
    const conflict = new ApiClientError("Shift code already exists", {
      status: 409,
      code: "CONFLICT",
    });
    api.post.mockRejectedValue(conflict);
    await expect(
      createShift({
        shiftCode: "GEN-01",
        name: "General Day Shift",
        startTime: "09:00",
        endTime: "17:00",
        workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
        gracePeriodMinutes: 15,
        earlyDepartureGraceMinutes: 10,
        expectedBreakMinutes: 60,
        flexible: false,
      }),
    ).rejects.toBe(conflict);

    api.patch.mockRejectedValue(
      new ApiClientError(
        "End active employee assignments before deactivating this shift",
        { status: 409, code: "CONFLICT" },
      ),
    );
    await expect(deactivateShift(shift.id)).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });
});
