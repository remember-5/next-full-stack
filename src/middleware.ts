import { getSessionCookie } from "better-auth/cookies";
import { type NextRequest, NextResponse } from "next/server";

import { getLoginRedirect } from "~/lib/auth/routing";

export function middleware(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const isAuthenticated = Boolean(sessionCookie);
  const { pathname, search } = request.nextUrl;

  if (
    !isAuthenticated &&
    (pathname.startsWith("/dashboard") || pathname.startsWith("/admin"))
  ) {
    return NextResponse.redirect(new URL(getLoginRedirect(pathname, search), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
