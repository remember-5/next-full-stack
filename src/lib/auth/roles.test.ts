import { expect, test } from "vitest";

import { hasRequiredRole, normalizeUserRole } from "./roles";

test("normalizeUserRole returns admin for the admin role", () => {
  expect(normalizeUserRole("admin")).toBe("admin");
});

test("normalizeUserRole coerces unknown roles to user", () => {
  expect(normalizeUserRole("super-admin")).toBe("user");
  expect(normalizeUserRole(undefined)).toBe("user");
});

test("hasRequiredRole only returns true for allowed roles", () => {
  expect(hasRequiredRole("admin", ["admin"])).toBe(true);
  expect(hasRequiredRole("user", ["admin"])).toBe(false);
});
