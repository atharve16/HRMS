import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  PayrollEmptyState,
  PayrollErrorState,
  PayrollSkeleton,
} from "./payroll-query-state";

describe("payroll-query-state", () => {
  it("renders PayrollErrorState with message and retry", () => {
    const html = renderToStaticMarkup(
      <PayrollErrorState
        message="Unable to reach payroll server."
        retry={vi.fn()}
      />,
    );

    expect(html).toContain("Payroll information is unavailable");
    expect(html).toContain("Unable to reach payroll server.");
    expect(html).toContain("Try again");
  });

  it("renders PayrollEmptyState with default and custom values", () => {
    const defaultHtml = renderToStaticMarkup(<PayrollEmptyState />);
    expect(defaultHtml).toContain("No payroll records found");

    const customHtml = renderToStaticMarkup(
      <PayrollEmptyState
        action={<button type="button">Run Generation</button>}
        description="Select another year."
        title="Custom Title"
      />,
    );

    expect(customHtml).toContain("Custom Title");
    expect(customHtml).toContain("Select another year.");
    expect(customHtml).toContain("Run Generation");
  });

  it("renders PayrollSkeleton with status role", () => {
    const html = renderToStaticMarkup(<PayrollSkeleton />);
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-label="Loading payroll data"');
  });
});
