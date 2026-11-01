import type { AuthenticatedUser } from "@/features/auth/types/auth";

export function getUserIdentity(user: AuthenticatedUser) {
  const localPart = user.email.split("@")[0];
  const initials = localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return {
    name: user.email,
    role: user.role === "ADMIN" ? "Administrator" : "Employee",
    initials: initials || user.email.slice(0, 2).toUpperCase(),
  };
}
