import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  NotificationEmptyState,
  NotificationErrorState,
  NotificationSkeleton,
} from "@/features/notifications/components/notification-query-state";

describe("notification-query-state", () => {
  it("renders empty state with custom copy", () => {
    const html = renderToStaticMarkup(
      <NotificationEmptyState
        description="Nothing to report."
        title="Zero notifications"
      />,
    );
    expect(html).toContain("Zero notifications");
    expect(html).toContain("Nothing to report.");
  });

  it("renders error state with retry action", () => {
    const html = renderToStaticMarkup(
      <NotificationErrorState
        message="Backend service unreachable"
        retry={vi.fn()}
      />,
    );
    expect(html).toContain("Notifications are unavailable");
    expect(html).toContain("Backend service unreachable");
    expect(html).toContain("Try again");
  });

  it("renders loading skeleton with status role", () => {
    const html = renderToStaticMarkup(<NotificationSkeleton />);
    expect(html).toContain('role="status"');
    expect(html).toContain("Loading notifications");
  });
});

