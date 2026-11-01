import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import {
  OfficeLocationEmptyState,
  OfficeLocationErrorState,
} from "@/features/office-locations/components/office-location-query-state";

describe("office location query states", () => {
  it("renders a filter-aware empty state", () => {
    const filteredHtml = renderToStaticMarkup(
      <OfficeLocationEmptyState filtered={true} />,
    );
    expect(filteredHtml).toContain("No matching office locations");
    expect(filteredHtml).toContain("clear the filters");

    const nonFilteredHtml = renderToStaticMarkup(
      <OfficeLocationEmptyState filtered={false} />,
    );
    expect(nonFilteredHtml).toContain("No office locations yet");
    expect(nonFilteredHtml).toContain("Create an office location");
  });

  it("renders an accessible error and retry action", () => {
    const html = renderToStaticMarkup(
      <OfficeLocationErrorState
        message="Service unavailable"
        retry={vi.fn()}
      />,
    );
    expect(html).toContain("Office location information is unavailable");
    expect(html).toContain("Service unavailable");
    expect(html).toContain("Try again");
  });
});

