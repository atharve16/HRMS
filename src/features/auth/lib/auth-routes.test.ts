import { describe, expect, it } from "vitest";

import {
  dashboardForRole,
  getRouteDecision,
  getSafeRedirectPath,
} from "@/features/auth/lib/auth-routes";

describe("role-aware routing", () => {
  it("redirects an unauthenticated admin route to login", () => {
    expect(getRouteDecision("ADMIN", null, "/admin/employees")).toEqual({
      allowed: false,
      redirectTo: "/login?redirect=%2Fadmin%2Femployees",
    });
  });

  it("allows the correct role without a redirect loop", () => {
    expect(getRouteDecision("ADMIN", "ADMIN", "/admin/dashboard")).toEqual({
      allowed: true,
    });
    expect(getRouteDecision("EMPLOYEE", "EMPLOYEE", "/employee/dashboard")).toEqual({
      allowed: true,
    });
  });

  it("redirects a wrong-role user to their own dashboard", () => {
    expect(getRouteDecision("ADMIN", "EMPLOYEE", "/admin/dashboard")).toEqual({
      allowed: false,
      redirectTo: "/employee/dashboard",
    });
    expect(getRouteDecision("EMPLOYEE", "ADMIN", "/employee/dashboard")).toEqual({
      allowed: false,
      redirectTo: "/admin/dashboard",
    });
  });

  it("maps each role to one stable dashboard", () => {
    expect(dashboardForRole("ADMIN")).toBe("/admin/dashboard");
    expect(dashboardForRole("EMPLOYEE")).toBe("/employee/dashboard");
  });

  it("accepts only role-compatible local return paths", () => {
    expect(getSafeRedirectPath("/admin/employees?status=active", "ADMIN")).toBe(
      "/admin/employees?status=active",
    );
    expect(getSafeRedirectPath("/employee/profile", "ADMIN")).toBeNull();
    expect(getSafeRedirectPath("https://evil.example/admin", "ADMIN")).toBeNull();
    expect(getSafeRedirectPath("//evil.example/admin", "ADMIN")).toBeNull();
    expect(getSafeRedirectPath("/\\evil.example/admin", "ADMIN")).toBeNull();
  });
});
