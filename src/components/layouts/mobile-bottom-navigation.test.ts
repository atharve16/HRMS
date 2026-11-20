import { describe, expect, it } from "vitest";

import { adminNavigation, employeeNavigation } from "@/constants/navigation";
import { flattenNavigationItems } from "@/components/layouts/mobile-bottom-navigation";

describe("mobile bottom navigation", () => {
  it("keeps every employee destination without duplicate links", () => {
    const items = flattenNavigationItems(employeeNavigation);

    expect(items.map((item) => item.href)).toEqual([
      "/employee/dashboard",
      "/employee/attendance",
      "/employee/leaves",
      "/employee/holidays",
      "/employee/salary",
      "/employee/notifications",
      "/employee/profile",
    ]);
  });

  it("flattens expandable admin groups into their child destinations", () => {
    const items = flattenNavigationItems(adminNavigation);
    const hrefs = items.map((item) => item.href);

    expect(hrefs).toContain("/admin/attendance/reports/monthly");
    expect(hrefs).toContain("/admin/attendance/reports/working-hours");
    expect(hrefs.filter((href) => href === "/admin/attendance")).toHaveLength(1);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });
});
