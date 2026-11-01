import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ShiftInformation } from "@/features/shifts/components/shift-information";
import { ShiftStatusBadge } from "@/features/shifts/components/shift-status-badge";
import type { Shift } from "@/features/shifts/types/shift-types";

const daytimeShift: Shift = {
  id: "6724a1b2c3d4e5f60718293b",
  shiftCode: "DAY-REG",
  name: "Standard Regular Shift",
  description: "Standard daily business hours",
  startTime: "09:00:00",
  endTime: "17:00:00",
  workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  gracePeriodMinutes: 15,
  earlyDepartureGraceMinutes: 10,
  expectedBreakMinutes: 60,
  minimumBreakMinutes: 30,
  flexible: false,
  status: "ACTIVE",
  createdAt: "2026-11-01T10:00:00Z",
  updatedAt: "2026-11-01T10:00:00Z",
};

const overnightShift: Shift = {
  id: "6724a1b2c3d4e5f60718293c",
  shiftCode: "NIGHT-OPS",
  name: "Night Security Shift",
  description: "Overnight facility security shift",
  startTime: "22:00:00",
  endTime: "06:00:00",
  workingDays: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
  gracePeriodMinutes: 20,
  earlyDepartureGraceMinutes: 15,
  expectedBreakMinutes: 45,
  minimumBreakMinutes: 30,
  flexible: true,
  status: "ACTIVE",
  createdAt: "2026-11-01T10:00:00Z",
  updatedAt: "2026-11-01T10:00:00Z",
};

describe("shift presentation components", () => {
  it("renders status badges for ACTIVE and INACTIVE states", () => {
    const activeHtml = renderToStaticMarkup(
      <ShiftStatusBadge status="ACTIVE" />,
    );
    expect(activeHtml).toContain("Active");

    const inactiveHtml = renderToStaticMarkup(
      <ShiftStatusBadge status="INACTIVE" />,
    );
    expect(inactiveHtml).toContain("Inactive");
  });

  it("renders daytime shift details and working days", () => {
    const html = renderToStaticMarkup(
      <ShiftInformation shift={daytimeShift} />,
    );

    expect(html).toContain("Standard Regular Shift");
    expect(html).toContain("DAY-REG");
    expect(html).toContain("9:00 AM – 5:00 PM");
    expect(html).toContain("8h");
    expect(html).toContain("Monday – Friday (5 days)");
    expect(html).toContain("15 minutes");
    expect(html).toContain("60 minutes");
    expect(html).toContain("30 minutes");
    expect(html).toContain("Fixed schedule");
    expect(html).not.toContain("Overnight Shift");
  });

  it("renders overnight badge, +1 day indicator, and flexible hours badge", () => {
    const html = renderToStaticMarkup(
      <ShiftInformation shift={overnightShift} />,
    );

    expect(html).toContain("Night Security Shift");
    expect(html).toContain("NIGHT-OPS");
    expect(html).toContain("10:00 PM – 6:00 AM (+1 day)");
    expect(html).toContain("Overnight Shift");
    expect(html).toContain("Flexible Hours");
    expect(html).toContain("Flexible attendance");
    expect(html).toContain("Overnight Shift Window");
  });
});

