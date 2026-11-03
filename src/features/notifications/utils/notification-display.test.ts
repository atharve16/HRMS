import { describe, expect, it } from "vitest";

import {
  formatNotificationTime,
  getNotificationTypeLabel,
  resolveNotificationTarget,
} from "@/features/notifications/utils/notification-display";

describe("notification-display", () => {
  it("resolves targets correctly", () => {
    expect(resolveNotificationTarget("HOLIDAY_ANNOUNCEMENT")).toBe(
      "/employee/holidays",
    );
    expect(resolveNotificationTarget("LEAVE_APPROVED")).toBe("/employee/leaves");
    expect(resolveNotificationTarget("LEAVE_REJECTED")).toBe("/employee/leaves");
  });

  it("provides correct type labels", () => {
    expect(getNotificationTypeLabel("HOLIDAY_ANNOUNCEMENT")).toBe("Holiday");
    expect(getNotificationTypeLabel("LEAVE_APPROVED")).toBe("Leave Approved");
    expect(getNotificationTypeLabel("LEAVE_REJECTED")).toBe("Leave Rejected");
  });

  it("formats recent timestamps", () => {
    const justNow = new Date(Date.now() - 10_000).toISOString();
    expect(formatNotificationTime(justNow)).toBe("Just now");

    const tenMinsAgo = new Date(Date.now() - 10 * 60_000).toISOString();
    expect(formatNotificationTime(tenMinsAgo)).toBe("10m ago");

    const twoHoursAgo = new Date(Date.now() - 2 * 3600_000).toISOString();
    expect(formatNotificationTime(twoHoursAgo)).toBe("2h ago");
  });
});

