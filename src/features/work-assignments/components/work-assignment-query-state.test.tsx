import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  WorkAssignmentEmptyState,
  WorkAssignmentErrorState,
  WorkAssignmentSkeleton,
} from "@/features/work-assignments/components/work-assignment-query-state";

describe("work assignment query states", () => {
  it("renders empty state with custom copy", () => {
    const html = renderToStaticMarkup(
      <WorkAssignmentEmptyState
        description="No assignments recorded for this employee."
        title="No work assignments found"
      />,
    );
    expect(html).toContain("No work assignments found");
    expect(html).toContain("No assignments recorded for this employee.");
  });

  it("renders accessible error state with retry button", () => {
    const html = renderToStaticMarkup(
      <WorkAssignmentErrorState message="Could not fetch assignments" retry={vi.fn()} />,
    );
    expect(html).toContain("Work assignment information is unavailable");
    expect(html).toContain("Could not fetch assignments");
    expect(html).toContain("Try again");
  });

  it("renders loading skeleton with status role", () => {
    const html = renderToStaticMarkup(<WorkAssignmentSkeleton />);
    expect(html).toContain('role="status"');
    expect(html).toContain("Loading assignments...");
  });
});

