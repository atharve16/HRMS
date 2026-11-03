import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  LeaveEmptyState,
  LeaveErrorState,
  LeaveSkeleton,
} from "@/features/leaves/components/leave-query-state";

describe("leave-query-state", () => {
  it("renders empty state with custom copy", () => {
    const html = renderToStaticMarkup(
      <LeaveEmptyState
        description="No leave applications on record."
        title="No leaves found"
      />,
    );
    expect(html).toContain("No leaves found");
    expect(html).toContain("No leave applications on record.");
  });

  it("renders error state with retry action", () => {
    const html = renderToStaticMarkup(
      <LeaveErrorState
        message="Backend service unreachable"
        retry={vi.fn()}
      />,
    );
    expect(html).toContain("Leave information is unavailable");
    expect(html).toContain("Backend service unreachable");
    expect(html).toContain("Try again");
  });

  it("renders loading skeleton with status role", () => {
    const html = renderToStaticMarkup(<LeaveSkeleton />);
    expect(html).toContain('role="status"');
    expect(html).toContain("Loading leave data");
  });
});

