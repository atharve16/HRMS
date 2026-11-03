import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  HolidayEmptyState,
  HolidayErrorState,
  HolidaySkeleton,
} from "@/features/holidays/components/holiday-query-state";

describe("holiday-query-state", () => {
  it("renders empty state with custom copy", () => {
    const html = renderToStaticMarkup(
      <HolidayEmptyState
        description="No company holidays scheduled."
        title="Zero holidays"
      />,
    );
    expect(html).toContain("Zero holidays");
    expect(html).toContain("No company holidays scheduled.");
  });

  it("renders error state with retry action", () => {
    const html = renderToStaticMarkup(
      <HolidayErrorState
        message="Backend service unreachable"
        retry={vi.fn()}
      />,
    );
    expect(html).toContain("Holiday information is unavailable");
    expect(html).toContain("Backend service unreachable");
    expect(html).toContain("Try again");
  });

  it("renders loading skeleton with status role", () => {
    const html = renderToStaticMarkup(<HolidaySkeleton />);
    expect(html).toContain('role="status"');
    expect(html).toContain("Loading holiday data");
  });
});

