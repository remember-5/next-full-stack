import assert from "node:assert/strict";
import test from "node:test";

import { NextRequest } from "next/server";

import { middleware } from "./middleware";

void test("login requests with stale auth cookies are not redirected by middleware", () => {
  const request = new NextRequest("https://example.com/login", {
    headers: {
      cookie: "better-auth.session_token=stale-session-token",
    },
  });

  const response = middleware(request);

  assert.equal(response.headers.get("location"), null);
});

void test("protected requests preserve the intended destination in the login redirect", () => {
  const request = new NextRequest("https://example.com/admin/menu?tab=editor");

  const response = middleware(request);

  assert.equal(
    response.headers.get("location"),
    "https://example.com/login?next=%2Fadmin%2Fmenu%3Ftab%3Deditor",
  );
});
