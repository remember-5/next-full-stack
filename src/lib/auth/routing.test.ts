import { expect, test } from "vitest";

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

test("home redirects logged-out users to /login", () => {
  expect(getHomeRedirect(null)).toBe("/login");
});

test("home redirects logged-in users to /dashboard", () => {
  expect(getHomeRedirect(createSession())).toBe("/dashboard");
});

test("auth pages redirect logged-in users to /dashboard", () => {
  expect(getAuthPageRedirect(createSession())).toBe("/dashboard");
});

test("auth pages preserve a safe next path for authenticated users", () => {
  expect(getAuthPageRedirect(createSession(), "/admin/menu")).toBe("/admin/menu");
});

test("auth pages allow logged-out users", () => {
  expect(getAuthPageRedirect(null)).toBeNull();
});

test("after-auth redirect falls back to /dashboard for unsafe targets", () => {
  expect(getAfterAuthRedirect("//evil.com")).toBe("/dashboard");
  expect(getAfterAuthRedirect("https://evil.com")).toBe("/dashboard");
  expect(getAfterAuthRedirect("dashboard")).toBe("/dashboard");
});

test("admin redirect rejects non-admin roles", () => {
  expect(getAdminRedirect(createSession("user"))).toBe("/dashboard");
});

test("admin redirect sends missing-role users to /login", () => {
  const baseSession = createSession();
  const sessionWithoutRole = {
    ...baseSession,
    user: {
      ...baseSession.user,
      role: undefined,
    },
  } satisfies Exclude<RoutingSession, null>;

  expect(getAdminRedirect(sessionWithoutRole)).toBe("/login");
});
