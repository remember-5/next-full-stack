import assert from "node:assert/strict";
import test from "node:test";

import { hasRequiredRole, normalizeUserRole } from "./roles";

void test("normalizeUserRole returns admin for the admin role", () => {
  assert.equal(normalizeUserRole("admin"), "admin");
});

void test("normalizeUserRole coerces unknown roles to user", () => {
  assert.equal(normalizeUserRole("super-admin"), "user");
  assert.equal(normalizeUserRole(undefined), "user");
});

void test("hasRequiredRole only returns true for allowed roles", () => {
  assert.equal(hasRequiredRole("admin", ["admin"]), true);
  assert.equal(hasRequiredRole("user", ["admin"]), false);
});
