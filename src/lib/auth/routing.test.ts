import assert from "node:assert/strict";
import test from "node:test";

import type { Session } from "~/server/better-auth/config";

import {
  getAfterAuthRedirect,
  getAdminRedirect,
  getAuthPageRedirect,
  getHomeRedirect,
  type RoutingSession,
} from "./routing";

const createSession = (role?: Session["user"]["role"]): Session =>
  ({
    session: {
      id: "session-id",
      userId: "user-id",
      expiresAt: new Date("2030-01-01T00:00:00.000Z"),
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      token: "token",
      ipAddress: null,
      userAgent: null,
    },
    user: {
      id: "user-id",
      email: "user@example.com",
      name: "Test User",
      emailVerified: false,
      image: null,
      createdAt: new Date("2024-01-01T00:00:00.000Z"),
      updatedAt: new Date("2024-01-01T00:00:00.000Z"),
      role: role ?? "user",
    },
  }) as Session;

void test("home redirects logged-out users to /login", () => {
  assert.equal(getHomeRedirect(null), "/login");
});

void test("home redirects logged-in users to /dashboard", () => {
  assert.equal(getHomeRedirect(createSession()), "/dashboard");
});

void test("auth pages redirect logged-in users to /dashboard", () => {
  assert.equal(getAuthPageRedirect(createSession()), "/dashboard");
});

void test("auth pages preserve a safe next path for authenticated users", () => {
  assert.equal(
    getAuthPageRedirect(createSession(), "/admin/menu"),
    "/admin/menu",
  );
});

void test("auth pages allow logged-out users", () => {
  assert.equal(getAuthPageRedirect(null), null);
});

void test("after-auth redirect falls back to /dashboard for unsafe targets", () => {
  assert.equal(getAfterAuthRedirect("//evil.com"), "/dashboard");
  assert.equal(getAfterAuthRedirect("https://evil.com"), "/dashboard");
  assert.equal(getAfterAuthRedirect("dashboard"), "/dashboard");
});

void test("admin redirect rejects non-admin roles", () => {
  assert.equal(getAdminRedirect(createSession("user")), "/dashboard");
});

void test("admin redirect sends missing-role users to /login", () => {
  const baseSession = createSession();
  const sessionWithoutRole = {
    ...baseSession,
    user: {
      ...baseSession.user,
      role: undefined,
    },
  } satisfies Exclude<RoutingSession, null>;

  assert.equal(getAdminRedirect(sessionWithoutRole), "/login");
});
