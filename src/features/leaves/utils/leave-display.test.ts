import { describe, expect, it } from "vitest";

import {
  canAdminReview,
  canEmployeeCancel,
  formatDays,
  formatLeaveDateRange,
  getLeaveStatusBadgeVariant,
  isPaidLeave,
  LEAVE_STATUS_LABELS,
  LEAVE_TYPE_LABELS,
} from "@/features/leaves/utils/leave-display";

describe("leave-display", () => {
  it("provides correct labels for all leave types", () => {
    expect(LEAVE_TYPE_LABELS.CL).toBe("Casual Leave");
    expect(LEAVE_TYPE_LABELS.SL).toBe("Sick Leave");
    expect(LEAVE_TYPE_LABELS.EL).toBe("Earned Leave");
    expect(LEAVE_TYPE_LABELS.LWP).toBe("Leave Without Pay");
    expect(LEAVE_TYPE_LABELS.CO).toBe("Compensatory Off");
  });

  it("provides correct labels for all leave statuses", () => {
    expect(LEAVE_STATUS_LABELS.PENDING).toBe("Pending");
    expect(LEAVE_STATUS_LABELS.APPROVED).toBe("Approved");
    expect(LEAVE_STATUS_LABELS.REJECTED).toBe("Rejected");
    expect(LEAVE_STATUS_LABELS.CANCELLED).toBe("Cancelled");
  });

  it("identifies paid vs unpaid leave", () => {
    expect(isPaidLeave("CL")).toBe(true);
    expect(isPaidLeave("SL")).toBe(true);
    expect(isPaidLeave("EL")).toBe(true);
    expect(isPaidLeave("CO")).toBe(true);
    expect(isPaidLeave("LWP")).toBe(false);
  });

  it("determines employee cancel permission", () => {
    expect(canEmployeeCancel("PENDING")).toBe(true);
    expect(canEmployeeCancel("APPROVED")).toBe(false);
    expect(canEmployeeCancel("REJECTED")).toBe(false);
    expect(canEmployeeCancel("CANCELLED")).toBe(false);
  });

  it("determines admin review permission", () => {
    expect(canAdminReview("PENDING")).toBe(true);
    expect(canAdminReview("APPROVED")).toBe(false);
    expect(canAdminReview("REJECTED")).toBe(false);
    expect(canAdminReview("CANCELLED")).toBe(false);
  });

  it("formats day counts", () => {
    expect(formatDays(1)).toBe("1 day");
    expect(formatDays(2.5)).toBe("2.5 days");
    expect(formatDays(5)).toBe("5 days");
  });

  it("formats date ranges", () => {
    expect(formatLeaveDateRange("2026-11-10", "2026-11-12")).toBe(
      "2026-11-10 to 2026-11-12",
    );
    expect(formatLeaveDateRange("2026-11-10", "2026-11-10")).toBe("2026-11-10");
    expect(formatLeaveDateRange("2026-11-10", null)).toBe("2026-11-10");
    expect(formatLeaveDateRange(null, null)).toBe("—");
  });

  it("returns badge variants for each status", () => {
    expect(getLeaveStatusBadgeVariant("PENDING").label).toBe("Pending");
    expect(getLeaveStatusBadgeVariant("APPROVED").label).toBe("Approved");
    expect(getLeaveStatusBadgeVariant("REJECTED").label).toBe("Rejected");
    expect(getLeaveStatusBadgeVariant("CANCELLED").label).toBe("Cancelled");
  });
});

