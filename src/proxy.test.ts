import { NextRequest } from "next/server";
import { expect, test } from "vitest";

import { proxy } from "./proxy";

test("login requests with stale auth cookies are not redirected by proxy", () => {
  const request = new NextRequest("https://example.com/login", {
    headers: {
      cookie: "better-auth.session_token=stale-session-token",
    },
  });

  const response = proxy(request);

  expect(response.headers.get("location")).toBeNull();
});

test("protected requests preserve the intended destination in the login redirect", () => {
  const request = new NextRequest("https://example.com/admin/menu?tab=editor");

  const response = proxy(request);

  expect(response.headers.get("location")).toBe(
    "https://example.com/login?next=%2Fadmin%2Fmenu%3Ftab%3Deditor",
  );
});
