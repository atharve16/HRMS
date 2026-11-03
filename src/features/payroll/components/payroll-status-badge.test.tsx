import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { PayrollStatusBadge } from "./payroll-status-badge";

describe("payroll-status-badge", () => {
  it("renders Draft label for DRAFT", () => {
    const html = renderToStaticMarkup(<PayrollStatusBadge status="DRAFT" />);
    expect(html).toContain("Draft");
  });

  it("renders Reviewed label for REVIEWED", () => {
    const html = renderToStaticMarkup(<PayrollStatusBadge status="REVIEWED" />);
    expect(html).toContain("Reviewed");
  });

  it("renders Finalized label for FINALIZED", () => {
    const html = renderToStaticMarkup(<PayrollStatusBadge status="FINALIZED" />);
    expect(html).toContain("Finalized");
  });

  it("renders Paid label for PAID", () => {
    const html = renderToStaticMarkup(<PayrollStatusBadge status="PAID" />);
    expect(html).toContain("Paid");
  });
});
