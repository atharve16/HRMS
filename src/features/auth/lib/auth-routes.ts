import type { UserRole } from "@/features/auth/types/auth";

export function dashboardForRole(role: UserRole) {
  return role === "ADMIN" ? "/admin/dashboard" : "/employee/dashboard";
}

export function getSafeRedirectPath(value: string | null, role: UserRole) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null;
  if (value.includes("\\") || /[\u0000-\u001f]/.test(value)) return null;

  try {
    const parsed = new URL(value, "https://hrms.local");
    if (parsed.origin !== "https://hrms.local") return null;

    const allowedRoot = role === "ADMIN" ? "/admin" : "/employee";
    if (
      parsed.pathname !== allowedRoot &&
      !parsed.pathname.startsWith(`${allowedRoot}/`)
    ) {
      return null;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return null;
  }
}

export type RouteDecision =
  | { allowed: true }
  | { allowed: false; redirectTo: string };

export function getRouteDecision(
  requiredRole: UserRole,
  currentRole: UserRole | null,
  currentPath: string,
): RouteDecision {
  if (!currentRole) {
    const redirect = encodeURIComponent(currentPath);
    return { allowed: false, redirectTo: `/login?redirect=${redirect}` };
  }

  if (currentRole !== requiredRole) {
    return { allowed: false, redirectTo: dashboardForRole(currentRole) };
  }

  return { allowed: true };
}
