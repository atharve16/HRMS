import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { DepartmentEmptyState, DepartmentErrorState } from "@/features/departments/components/department-query-state";

describe("department query states", () => {
  it("renders a filter-aware empty state", () => {
    const html = renderToStaticMarkup(<DepartmentEmptyState filtered />);
    expect(html).toContain("No matching departments");
    expect(html).toContain("clear the filters");
  });

  it("renders an accessible error and retry action", () => {
    const html = renderToStaticMarkup(<DepartmentErrorState message="Service unavailable" retry={vi.fn()} />);
    expect(html).toContain("Service unavailable");
    expect(html).toContain("Try again");
  });
});
