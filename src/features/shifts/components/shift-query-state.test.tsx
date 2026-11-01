import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  ShiftEmptyState,
  ShiftErrorState,
} from "@/features/shifts/components/shift-query-state";

describe("shift query states", () => {
  it("renders a filter-aware empty state", () => {
    const filteredHtml = renderToStaticMarkup(
      <ShiftEmptyState filtered={true} />,
    );
    expect(filteredHtml).toContain("No matching shifts");
    expect(filteredHtml).toContain("clear the filters");

    const nonFilteredHtml = renderToStaticMarkup(
      <ShiftEmptyState filtered={false} />,
    );
    expect(nonFilteredHtml).toContain("No shifts yet");
    expect(nonFilteredHtml).toContain("Create a work shift");
  });

  it("renders an accessible error and retry action", () => {
    const html = renderToStaticMarkup(
      <ShiftErrorState message="Service unavailable" retry={vi.fn()} />,
    );
    expect(html).toContain("Shift information is unavailable");
    expect(html).toContain("Service unavailable");
    expect(html).toContain("Try again");
  });
});

