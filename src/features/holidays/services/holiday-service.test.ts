import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  patch: vi.fn(),
}));
vi.mock("@/services/api-client", () => ({ apiClient: api }));

import {
  createHoliday,
  deactivateHoliday,
  getHolidayDetail,
  getUpcomingHolidays,
  listAdminHolidays,
  listEmployeeHolidays,
  updateHoliday,
} from "@/features/holidays/services/holiday-service";
import type {
  AdminHolidayResponse,
  CreateHolidayRequest,
  EmployeeHolidayResponse,
  HolidayPageResponse,
  UpdateHolidayRequest,
} from "@/features/holidays/types/holiday-types";

const sampleAdminHoliday: AdminHolidayResponse = {
  id: "hol-101",
  name: "New Year's Day",
  description: "Celebration of the new calendar year",
  date: "2026-01-01",
  active: true,
  createdBy: "usr-admin-1",
  updatedBy: "usr-admin-1",
  createdAt: "2025-12-01T00:00:00Z",
  updatedAt: "2025-12-01T00:00:00Z",
};

const sampleEmployeeHoliday: EmployeeHolidayResponse = {
  id: "hol-101",
  name: "New Year's Day",
  description: "Celebration of the new calendar year",
  date: "2026-01-01",
};

const samplePage: HolidayPageResponse = {
  content: [sampleAdminHoliday],
  page: 0,
  limit: 20,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
};

describe("holiday-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createHoliday", () => {
    it("posts to /admin/holidays and returns holiday data", async () => {
      const payload: CreateHolidayRequest = {
        name: "Republic Day",
        date: "2026-01-26",
        description: "National holiday",
      };
      api.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Company holiday created",
          data: sampleAdminHoliday,
        },
      });

      const result = await createHoliday(payload);
      expect(api.post).toHaveBeenCalledWith("/admin/holidays", payload);
      expect(result).toEqual(sampleAdminHoliday);
    });
  });

  describe("listAdminHolidays", () => {
    it("gets /admin/holidays with query params", async () => {
      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Company holidays retrieved",
          data: samplePage,
        },
      });

      const params = { year: 2026, active: true, page: 0, limit: 10 };
      const result = await listAdminHolidays(params);
      expect(api.get).toHaveBeenCalledWith("/admin/holidays", { params });
      expect(result).toEqual(samplePage);
    });
  });

  describe("getHolidayDetail", () => {
    it("gets /admin/holidays/:holidayId", async () => {
      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Company holiday retrieved",
          data: sampleAdminHoliday,
        },
      });

      const result = await getHolidayDetail("hol-101");
      expect(api.get).toHaveBeenCalledWith("/admin/holidays/hol-101");
      expect(result).toEqual(sampleAdminHoliday);
    });
  });

  describe("updateHoliday", () => {
    it("patches /admin/holidays/:holidayId", async () => {
      const updatePayload: UpdateHolidayRequest = {
        name: "Updated Holiday Name",
      };
      const updated = { ...sampleAdminHoliday, name: "Updated Holiday Name" };
      api.patch.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Company holiday updated",
          data: updated,
        },
      });

      const result = await updateHoliday("hol-101", updatePayload);
      expect(api.patch).toHaveBeenCalledWith(
        "/admin/holidays/hol-101",
        updatePayload,
      );
      expect(result.name).toBe("Updated Holiday Name");
    });
  });

  describe("deactivateHoliday", () => {
    it("patches /admin/holidays/:holidayId/deactivate", async () => {
      const deactivated = { ...sampleAdminHoliday, active: false };
      api.patch.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Company holiday deactivated",
          data: deactivated,
        },
      });

      const result = await deactivateHoliday("hol-101");
      expect(api.patch).toHaveBeenCalledWith(
        "/admin/holidays/hol-101/deactivate",
      );
      expect(result.active).toBe(false);
    });
  });

  describe("listEmployeeHolidays", () => {
    it("gets /holidays with optional year and date filters", async () => {
      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Company holidays retrieved",
          data: [sampleEmployeeHoliday],
        },
      });

      const params = { year: 2026 };
      const result = await listEmployeeHolidays(params);
      expect(api.get).toHaveBeenCalledWith("/holidays", { params });
      expect(result).toEqual([sampleEmployeeHoliday]);
    });
  });

  describe("getUpcomingHolidays", () => {
    it("gets /holidays/upcoming", async () => {
      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Upcoming company holidays retrieved",
          data: [sampleEmployeeHoliday],
        },
      });

      const result = await getUpcomingHolidays();
      expect(api.get).toHaveBeenCalledWith("/holidays/upcoming");
      expect(result).toEqual([sampleEmployeeHoliday]);
    });
  });
});

