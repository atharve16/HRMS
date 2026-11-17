import { describe, expect, it } from "vitest";
import type { LeavePeriodBalanceResponse } from "@/features/leaves/types/leave-types";

describe("monthly leave balance contracts", () => {
  it("represent carried, pending and expired days independently", () => {
    const balance: LeavePeriodBalanceResponse = { id: "b1", employeeId: "e1", leaveType: "EL", period: "2026-11", allocatedDays: 2, carriedForwardDays: 3, expiredDays: 0, usedDays: 1, pendingDays: 1, availableDays: 3, updatedAt: null };
    expect(balance.allocatedDays + balance.carriedForwardDays - balance.usedDays - balance.pendingDays).toBe(balance.availableDays);
  });
});
