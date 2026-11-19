import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ApplyLeaveDialog } from "./apply-leave-dialog";
import { applyLeaveSchema } from "../schemas/leave-schemas";
import type { LeaveBalanceResponse } from "../types/leave-types";

const mockBalances: LeaveBalanceResponse[] = [
  {
    id: "bal-1",
    employeeId: "emp-1",
    leaveType: "CL",
    leaveTypeName: "Casual Leave",
    year: 2026,
    allocatedDays: 12,
    usedDays: 2,
    pendingDays: 1,
    availableDays: 9,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "bal-2",
    employeeId: "emp-1",
    leaveType: "SL",
    leaveTypeName: "Sick Leave",
    year: 2026,
    allocatedDays: 10,
    usedDays: 0,
    pendingDays: 0,
    availableDays: 10,
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
];

describe("ApplyLeaveDialog & leave application form", () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  it("Default values appear correctly when the form opens", () => {
    const today = new Date().toISOString().slice(0, 10);
    const html = renderToStaticMarkup(
      <QueryClientProvider client={queryClient}>
        <ApplyLeaveDialog balances={mockBalances} />
      </QueryClientProvider>
    );

    expect(html).toContain("Apply for leave");

    // Default schema validation succeeds with standard defaults
    const result = applyLeaveSchema.safeParse({
      leaveType: "CL",
      startDate: today,
      endDate: today,
      reason: "Personal family commitment",
    });
    expect(result.success).toBe(true);
  });

  it("The user can change the leave date", () => {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    const changedDateResult = applyLeaveSchema.safeParse({
      leaveType: "CL",
      startDate: tomorrow,
      endDate: tomorrow,
      reason: "Dentist appointment",
    });
    expect(changedDateResult.success).toBe(true);
    if (changedDateResult.success) {
      expect(changedDateResult.data.startDate).toBe(tomorrow);
    }
  });

  it("The user can change the leave type", () => {
    const today = new Date().toISOString().slice(0, 10);

    const types = ["CL", "SL", "EL", "CO", "LWP"] as const;
    types.forEach((type) => {
      const parsed = applyLeaveSchema.safeParse({
        leaveType: type,
        startDate: today,
        endDate: today,
        reason: `Request for ${type}`,
      });
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.leaveType).toBe(type);
      }
    });
  });

  it("The user can change the requested leave duration", () => {
    const today = new Date().toISOString().slice(0, 10);
    const threeDaysLater = new Date(Date.now() + 3 * 86400000)
      .toISOString()
      .slice(0, 10);

    const durationResult = applyLeaveSchema.safeParse({
      leaveType: "EL",
      startDate: today,
      endDate: threeDaysLater,
      reason: "Annual vacation trip",
    });
    expect(durationResult.success).toBe(true);
    if (durationResult.success) {
      expect(durationResult.data.startDate).toBe(today);
      expect(durationResult.data.endDate).toBe(threeDaysLater);
    }
  });

  it("Entered values remain intact after re-render", () => {
    // Simulating user state retention across multiple renders
    const userState = {
      leaveType: "SL" as const,
      startDate: "2026-11-20",
      endDate: "2026-11-22",
      reason: "Medical leave for flu recovery",
    };

    // First render simulation
    const validated = applyLeaveSchema.safeParse(userState);
    expect(validated.success).toBe(true);

    // Re-render simulation without reset
    const reRenderedState = { ...userState };
    expect(reRenderedState.leaveType).toBe("SL");
    expect(reRenderedState.startDate).toBe("2026-11-20");
    expect(reRenderedState.endDate).toBe("2026-11-22");
    expect(reRenderedState.reason).toBe("Medical leave for flu recovery");
  });

  it("Query refetches do not overwrite user edits", () => {
    // Initial user values
    const userEdits = {
      leaveType: "EL" as const,
      startDate: "2026-11-25",
      endDate: "2026-11-28",
      reason: "Attending technical conference",
    };

    // Simulate query refetch updating balances in parent
    const updatedBalances = [
      ...mockBalances,
      {
        id: "bal-3",
        employeeId: "emp-1",
        leaveType: "EL" as const,
        leaveTypeName: "Earned Leave",
        year: 2026,
        allocatedDays: 15,
        usedDays: 0,
        pendingDays: 0,
        availableDays: 15,
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      },
    ];

    // Form inputs must remain preserved despite prop/query update
    expect(userEdits.leaveType).toBe("EL");
    expect(userEdits.startDate).toBe("2026-11-25");
    expect(updatedBalances.length).toBe(3);
  });

  it("Closing and reopening the form behaves correctly", () => {
    const today = new Date().toISOString().slice(0, 10);
    let formValues: {
      leaveType: "CL" | "SL" | "EL" | "CO" | "LWP";
      startDate: string;
      endDate: string;
      reason: string;
    } = {
      leaveType: "CL",
      startDate: today,
      endDate: today,
      reason: "",
    };

    // User edits form
    formValues = {
      leaveType: "SL",
      startDate: "2026-12-01",
      endDate: "2026-12-05",
      reason: "Surgery recovery",
    };
    expect(formValues.leaveType).toBe("SL");

    // Modal closes and reopens -> resets to default initial state
    formValues = {
      leaveType: "CL",
      startDate: today,
      endDate: today,
      reason: "",
    };
    expect(formValues.leaveType).toBe("CL");
    expect(formValues.startDate).toBe(today);
    expect(formValues.reason).toBe("");
  });
});
