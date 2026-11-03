import { describe, expect, it } from "vitest";

import {
  allocateBalanceSchema,
  applyLeaveSchema,
  rejectLeaveSchema,
} from "@/features/leaves/schemas/leave-schemas";

describe("leave-schemas", () => {
  describe("applyLeaveSchema", () => {
    const futureStart = "2099-01-10";
    const futureEnd = "2099-01-15";

    it("validates a correct apply leave payload", () => {
      const result = applyLeaveSchema.safeParse({
        leaveType: "CL",
        startDate: futureStart,
        endDate: futureEnd,
        reason: "Annual vacation with family",
      });
      expect(result.success).toBe(true);
    });

    it("rejects an invalid leave type", () => {
      const result = applyLeaveSchema.safeParse({
        leaveType: "INVALID",
        startDate: futureStart,
        endDate: futureEnd,
        reason: "Vacation",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("leaveType");
      }
    });

    it("rejects invalid date formats", () => {
      const result = applyLeaveSchema.safeParse({
        leaveType: "SL",
        startDate: "10-01-2099",
        endDate: "2099/01/12",
        reason: "Medical leave",
      });
      expect(result.success).toBe(false);
    });

    it("rejects past start dates", () => {
      const result = applyLeaveSchema.safeParse({
        leaveType: "SL",
        startDate: "2020-01-01",
        endDate: "2020-01-02",
        reason: "Medical leave",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const pastIssue = result.error.issues.find(
          (issue) => issue.path[0] === "startDate",
        );
        expect(pastIssue?.message).toMatch(/past/i);
      }
    });

    it("rejects when end date is earlier than start date", () => {
      const result = applyLeaveSchema.safeParse({
        leaveType: "EL",
        startDate: "2099-05-10",
        endDate: "2099-05-08",
        reason: "Vacation",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const orderIssue = result.error.issues.find(
          (issue) => issue.path[0] === "endDate",
        );
        expect(orderIssue?.message).toMatch(/earlier than start date/i);
      }
    });

    it("rejects an empty reason", () => {
      const result = applyLeaveSchema.safeParse({
        leaveType: "CO",
        startDate: futureStart,
        endDate: futureEnd,
        reason: "   ",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("rejectLeaveSchema", () => {
    it("accepts valid remarks", () => {
      const result = rejectLeaveSchema.safeParse({
        remarks: "Critical sprint deadline",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty remarks", () => {
      const result = rejectLeaveSchema.safeParse({
        remarks: "   ",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("allocateBalanceSchema", () => {
    it("accepts valid allocation payload", () => {
      const result = allocateBalanceSchema.safeParse({
        leaveType: "CL",
        year: 2026,
        allocatedDays: 14,
      });
      expect(result.success).toBe(true);
    });

    it("rejects LWP allocation", () => {
      const result = allocateBalanceSchema.safeParse({
        leaveType: "LWP",
        year: 2026,
        allocatedDays: 10,
      });
      expect(result.success).toBe(false);
    });

    it("rejects negative days", () => {
      const result = allocateBalanceSchema.safeParse({
        leaveType: "SL",
        year: 2026,
        allocatedDays: -1,
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid years", () => {
      const result = allocateBalanceSchema.safeParse({
        leaveType: "SL",
        year: 1990,
        allocatedDays: 10,
      });
      expect(result.success).toBe(false);
    });
  });
});

