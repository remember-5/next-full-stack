import "server-only";

import { redirect } from "next/navigation";

import {
  getAdminRedirect,
  getAuthPageRedirect,
} from "~/lib/auth/routing";
import { normalizeUserRole } from "~/lib/auth/roles";

import { getSession } from "./server";

type ServerSession = Awaited<ReturnType<typeof getSession>>;
type AuthenticatedSession = NonNullable<ServerSession>;
type AdminSession = AuthenticatedSession & {
  user: AuthenticatedSession["user"] & {
    role: "admin";
  };
};

function assertAuthenticatedSession(
  session: ServerSession,
): asserts session is AuthenticatedSession {
  if (!session) {
    redirect("/login");
  }
}

function assertAdminSession(session: ServerSession): asserts session is AdminSession {
  const redirectTo = getAdminRedirect(session);

  if (redirectTo) {
    redirect(redirectTo);
  }
}

export async function redirectAuthenticatedUser(nextPath?: string | null) {
  const session = await getSession();
  const redirectTo = getAuthPageRedirect(session, nextPath);

  if (redirectTo) {
    redirect(redirectTo);
  }

  return session;
}

export async function requireSession() {
  const session = await getSession();
  assertAuthenticatedSession(session);
  return {
    ...session,
    user: {
      ...session.user,
      role: normalizeUserRole(session.user.role),
    },
  };
}

export async function requireAdminSession() {
  const session = await getSession();
  assertAdminSession(session);
  return {
    ...session,
    user: {
      ...session.user,
      role: normalizeUserRole(session.user.role),
    },
  };
}
