import type { UserRole } from "~/server/better-auth/config";

export function normalizeUserRole(role?: string | null): UserRole {
  return role === "admin" ? "admin" : "user";
}

export function hasRequiredRole(
  role: string | null | undefined,
  allowedRoles: readonly UserRole[],
): role is UserRole {
  return allowedRoles.some((allowedRole) => role === allowedRole);
}
