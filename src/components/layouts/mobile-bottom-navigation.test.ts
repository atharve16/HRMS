import { describe, expect, it } from "vitest";
import { LayoutDashboard, List } from "lucide-react";

import { adminNavigation, employeeNavigation } from "@/constants/navigation";
import {
  DESKTOP_SIDEBAR_MARKER_CLASS,
  DESKTOP_SIDEBAR_VISIBILITY_CLASS,
  MOBILE_BOTTOM_NAVIGATION_SAFE_AREA_CLASS,
  MOBILE_NAVIGATION_MARKER_CLASS,
  MOBILE_NAVIGATION_VISIBILITY_CLASS,
  flattenNavigationItems,
  getActiveNavigationHref,
} from "@/components/layouts/navigation-model";

describe("mobile bottom navigation", () => {
  it("exposes every employee sidebar destination exactly once", () => {
    expect(flattenNavigationItems(employeeNavigation).map((item) => item.href)).toEqual([
      "/employee/dashboard",
      "/employee/attendance",
      "/employee/leaves",
      "/employee/holidays",
      "/employee/salary",
      "/employee/notifications",
      "/employee/profile",
    ]);
  });

  it("exposes every admin sidebar destination exactly once", () => {
    const hrefs = flattenNavigationItems(adminNavigation).map((item) => item.href);

    expect(hrefs).toEqual([
      "/admin/dashboard",
      "/admin/employees",
      "/admin/departments",
      "/admin/attendance",
      "/admin/attendance/reports/monthly",
      "/admin/attendance/reports/working-hours",
      "/admin/attendance/reports/overtime-late",
      "/admin/shifts",
      "/admin/office-locations",
      "/admin/work-assignments",
      "/admin/leaves",
      "/admin/holidays",
      "/admin/payroll",
      "/admin/bonuses",
      "/admin/settings",
    ]);
    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("keeps role navigation separated and includes nested submenu destinations", () => {
    const adminHrefs = new Set(flattenNavigationItems(adminNavigation).map((item) => item.href));
    const employeeHrefs = new Set(flattenNavigationItems(employeeNavigation).map((item) => item.href));

    expect([...employeeHrefs].every((href) => !adminHrefs.has(href))).toBe(true);

    const nested = flattenNavigationItems([
      {
        label: "Nested",
        items: [
          {
            label: "Parent",
            href: "/parent",
            icon: LayoutDashboard,
            children: [
              {
                label: "Child group",
                href: "/parent/group",
                icon: List,
                children: [
                  { label: "Nested destination", href: "/parent/group/item", icon: List },
                ],
              },
            ],
          },
        ],
      },
    ]);

    expect(nested.map((item) => item.href)).toEqual(["/parent/group/item"]);
  });

  it("highlights the most specific active route", () => {
    const items = flattenNavigationItems(adminNavigation);

    expect(getActiveNavigationHref("/admin/attendance/reports/monthly", items)).toBe(
      "/admin/attendance/reports/monthly",
    );
    expect(getActiveNavigationHref("/admin/payroll/record-1", items)).toBe(
      "/admin/payroll",
    );
  });

  it("provides explicit APK selectors independent of viewport breakpoints", () => {
    expect(DESKTOP_SIDEBAR_MARKER_CLASS).toBe("dashboard-sidebar");
    expect(MOBILE_NAVIGATION_MARKER_CLASS).toBe("dashboard-mobile-navigation");
    expect(DESKTOP_SIDEBAR_VISIBILITY_CLASS).toBe("hidden lg:flex");
    expect(MOBILE_NAVIGATION_VISIBILITY_CLASS).toBe("lg:hidden");
    expect(MOBILE_BOTTOM_NAVIGATION_SAFE_AREA_CLASS).toBe("mobile-bottom-navigation");
  });
});
