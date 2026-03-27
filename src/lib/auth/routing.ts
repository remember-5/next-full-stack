export type RoutingSession =
  | {
      user?: {
        role?: string | null;
      } | null;
    }
  | null;

export function getAfterAuthRedirect(nextPath?: string | null) {
  return getSafeRedirectTarget(nextPath) ?? "/dashboard";
}

export function getHomeRedirect(session: RoutingSession) {
  return session ? "/dashboard" : "/login";
}

export function getAuthPageRedirect(
  session: RoutingSession,
  nextPath?: string | null,
) {
  return session ? getAfterAuthRedirect(nextPath) : null;
}

export function getAdminRedirect(session: RoutingSession) {
  const role = session?.user?.role;

  if (!role) {
    return "/login";
  }

  return role === "admin" ? null : "/dashboard";
}

export function getLoginRedirect(pathname: string, search = "") {
  const nextPath = `${pathname}${search}`;
  const safeNext = getSafeRedirectTarget(nextPath);

  return safeNext
    ? `/login?next=${encodeURIComponent(safeNext)}`
    : "/login";
}

export function getSafeRedirectTarget(value?: string | null) {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();

  if (!trimmedValue.startsWith("/") || trimmedValue.startsWith("//")) {
    return null;
  }

  return trimmedValue;
}
