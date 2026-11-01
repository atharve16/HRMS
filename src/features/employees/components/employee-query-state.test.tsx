import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { EmployeeEmptyState, EmployeeErrorState } from "@/features/employees/components/employee-query-state";

describe("employee query states", () => {
  it("renders a filter-aware empty state", () => {
    const html = renderToStaticMarkup(<EmployeeEmptyState filtered />);
    expect(html).toContain("No matching employees");
    expect(html).toContain("clear the filters");
  });

  it("renders an accessible error with a retry action", () => {
    const html = renderToStaticMarkup(<EmployeeErrorState message="Service unavailable" retry={vi.fn()} />);
    expect(html).toContain("Service unavailable");
    expect(html).toContain("Try again");
  });
});
