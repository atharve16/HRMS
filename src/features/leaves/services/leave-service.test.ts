import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
}));
vi.mock("@/services/api-client", () => ({ apiClient: api }));

import {
  allocateEmployeeLeaveBalance,
  applyLeave,
  approveLeave,
  cancelLeave,
  getEmployeeLeaveBalances,
  getLeaveDetail,
  getMyLeaveBalances,
  getMyLeaves,
  listAdminLeaves,
  rejectLeave,
} from "@/features/leaves/services/leave-service";
import type {
  AllocateLeaveBalanceRequest,
  ApplyLeaveRequest,
  LeaveBalanceResponse,
  LeaveRequestPageResponse,
  LeaveRequestResponse,
  RejectLeaveRequest,
} from "@/features/leaves/types/leave-types";

const sampleLeaveRequest: LeaveRequestResponse = {
  id: "leave-101",
  employeeId: "emp-201",
  employeeCode: "EMP-001",
  leaveType: "CL",
  leaveTypeName: "Casual Leave",
  startDate: "2026-11-10",
  endDate: "2026-11-12",
  totalDays: 3,
  reason: "Family function",
  status: "PENDING",
  paid: true,
  adminRemarks: null,
  reviewedBy: null,
  reviewedAt: null,
  createdAt: "2026-11-02T10:00:00Z",
  updatedAt: "2026-11-02T10:00:00Z",
};

const sampleBalance: LeaveBalanceResponse = {
  id: "bal-301",
  employeeId: "emp-201",
  leaveType: "CL",
  leaveTypeName: "Casual Leave",
  year: 2026,
  allocatedDays: 12,
  usedDays: 2,
  pendingDays: 3,
  availableDays: 7,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-11-02T10:00:00Z",
};

const samplePage: LeaveRequestPageResponse = {
  content: [sampleLeaveRequest],
  page: 0,
  limit: 20,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
};

describe("leave-service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("applyLeave", () => {
    it("posts to /leaves and returns request data", async () => {
      const payload: ApplyLeaveRequest = {
        leaveType: "CL",
        startDate: "2026-11-10",
        endDate: "2026-11-12",
        reason: "Family function",
      };
      api.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Leave request submitted",
          data: sampleLeaveRequest,
        },
      });

      const result = await applyLeave(payload);
      expect(api.post).toHaveBeenCalledWith("/leaves", payload);
      expect(result).toEqual(sampleLeaveRequest);
    });
  });

  describe("getMyLeaves", () => {
    it("gets /leaves/me with query params", async () => {
      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Leave requests retrieved",
          data: samplePage,
        },
      });

      const params = { status: "PENDING" as const, page: 0, limit: 10 };
      const result = await getMyLeaves(params);
      expect(api.get).toHaveBeenCalledWith("/leaves/me", { params });
      expect(result).toEqual(samplePage);
    });
  });

  describe("getMyLeaveBalances", () => {
    it("gets /leaves/me/balance with optional year", async () => {
      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Leave balances retrieved",
          data: [sampleBalance],
        },
      });

      const result = await getMyLeaveBalances(2026);
      expect(api.get).toHaveBeenCalledWith("/leaves/me/balance", {
        params: { year: 2026 },
      });
      expect(result).toEqual([sampleBalance]);
    });

    it("gets /leaves/me/balance without year when omitted", async () => {
      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Leave balances retrieved",
          data: [sampleBalance],
        },
      });

      const result = await getMyLeaveBalances();
      expect(api.get).toHaveBeenCalledWith("/leaves/me/balance", {
        params: undefined,
      });
      expect(result).toEqual([sampleBalance]);
    });
  });

  describe("cancelLeave", () => {
    it("patches /leaves/:leaveId/cancel", async () => {
      const cancelled = { ...sampleLeaveRequest, status: "CANCELLED" as const };
      api.patch.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Leave request cancelled",
          data: cancelled,
        },
      });

      const result = await cancelLeave("leave-101");
      expect(api.patch).toHaveBeenCalledWith("/leaves/leave-101/cancel");
      expect(result.status).toBe("CANCELLED");
    });
  });

  describe("listAdminLeaves", () => {
    it("gets /admin/leaves with search params", async () => {
      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Leave requests retrieved",
          data: samplePage,
        },
      });

      const params = { employeeCode: "EMP-001", page: 0, limit: 20 };
      const result = await listAdminLeaves(params);
      expect(api.get).toHaveBeenCalledWith("/admin/leaves", { params });
      expect(result).toEqual(samplePage);
    });
  });

  describe("getLeaveDetail", () => {
    it("gets /admin/leaves/:leaveId", async () => {
      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Leave request retrieved",
          data: sampleLeaveRequest,
        },
      });

      const result = await getLeaveDetail("leave-101");
      expect(api.get).toHaveBeenCalledWith("/admin/leaves/leave-101");
      expect(result).toEqual(sampleLeaveRequest);
    });
  });

  describe("approveLeave", () => {
    it("patches /admin/leaves/:leaveId/approve", async () => {
      const approved = { ...sampleLeaveRequest, status: "APPROVED" as const };
      api.patch.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Leave request approved",
          data: approved,
        },
      });

      const result = await approveLeave("leave-101");
      expect(api.patch).toHaveBeenCalledWith("/admin/leaves/leave-101/approve");
      expect(result.status).toBe("APPROVED");
    });
  });

  describe("rejectLeave", () => {
    it("patches /admin/leaves/:leaveId/reject with remarks body", async () => {
      const payload: RejectLeaveRequest = { remarks: "Team coverage needed" };
      const rejected = {
        ...sampleLeaveRequest,
        status: "REJECTED" as const,
        adminRemarks: payload.remarks,
      };
      api.patch.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Leave request rejected",
          data: rejected,
        },
      });

      const result = await rejectLeave("leave-101", payload);
      expect(api.patch).toHaveBeenCalledWith(
        "/admin/leaves/leave-101/reject",
        payload,
      );
      expect(result.status).toBe("REJECTED");
      expect(result.adminRemarks).toBe("Team coverage needed");
    });
  });

  describe("getEmployeeLeaveBalances", () => {
    it("gets /admin/employees/:employeeId/leave-balance with year", async () => {
      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Employee leave balances retrieved",
          data: [sampleBalance],
        },
      });

      const result = await getEmployeeLeaveBalances("emp-201", 2026);
      expect(api.get).toHaveBeenCalledWith(
        "/admin/employees/emp-201/leave-balance",
        { params: { year: 2026 } },
      );
      expect(result).toEqual([sampleBalance]);
    });
  });

  describe("allocateEmployeeLeaveBalance", () => {
    it("puts /admin/employees/:employeeId/leave-balance with allocation payload", async () => {
      const payload: AllocateLeaveBalanceRequest = {
        leaveType: "CL",
        year: 2026,
        allocatedDays: 15,
      };
      const updatedBalance = { ...sampleBalance, allocatedDays: 15, availableDays: 10 };
      api.put.mockResolvedValueOnce({
        data: {
          success: true,
          message: "Leave balance allocated",
          data: updatedBalance,
        },
      });

      const result = await allocateEmployeeLeaveBalance("emp-201", payload);
      expect(api.put).toHaveBeenCalledWith(
        "/admin/employees/emp-201/leave-balance",
        payload,
      );
      expect(result.allocatedDays).toBe(15);
      expect(result.availableDays).toBe(10);
    });
  });
});

