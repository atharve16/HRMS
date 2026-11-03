import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  AttendanceEmptyState,
  AttendanceErrorState,
  AttendanceSkeleton,
} from "@/features/attendance/components/attendance-query-state";

describe("attendance query state components", () => {
  it("renders empty state with custom copy", () => {
    const html = renderToStaticMarkup(
      <AttendanceEmptyState
        description="No punches recorded for this period."
        title="Zero attendance logs"
      />,
    );
    expect(html).toContain("Zero attendance logs");
    expect(html).toContain("No punches recorded for this period.");
  });

  it("renders accessible error state with retry action", () => {
    const html = renderToStaticMarkup(
      <AttendanceErrorState
        message="Backend service unreachable"
        retry={vi.fn()}
      />,
    );
    expect(html).toContain("Attendance information is unavailable");
    expect(html).toContain("Backend service unreachable");
    expect(html).toContain("Try again");
  });

  it("renders loading skeleton with status role", () => {
    const html = renderToStaticMarkup(<AttendanceSkeleton />);
    expect(html).toContain('role="status"');
    expect(html).toContain("Loading attendance records...");
  });
});

