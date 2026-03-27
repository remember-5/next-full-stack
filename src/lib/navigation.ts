import {
  navigationRegistry,
  type NavigationBreadcrumb,
  type NavigationItem,
} from "~/config/navigation";
import type { UserRole } from "~/server/better-auth/config";

export {
  navigationSectionRegistry,
  navigationUiLabels,
} from "~/config/navigation";
export type { NavigationBreadcrumb, NavigationItem } from "~/config/navigation";

function cloneBreadcrumbs(
  breadcrumbs: NavigationBreadcrumb[],
): NavigationBreadcrumb[] {
  return breadcrumbs.map((breadcrumb) => ({ ...breadcrumb }));
}

export function normalizePathname(pathname: string): string {
  if (pathname === "/") {
    return pathname;
  }

  return pathname.replace(/\/+$/, "") || "/";
}

export function getBestMatch(pathname: string, urls: string[]): string | null {
  const currentPath = normalizePathname(pathname);
  let bestMatch: string | null = null;

  for (const url of urls) {
    const targetPath = normalizePathname(url);
    const isMatch =
      currentPath === targetPath ||
      currentPath.startsWith(`${targetPath}/`);

    if (!isMatch) {
      continue;
    }

    if (!bestMatch || targetPath.length > normalizePathname(bestMatch).length) {
      bestMatch = url;
    }
  }

  return bestMatch;
}

function selectVisibleItem(
  item: NavigationItem,
  role: UserRole,
): NavigationItem | null {
  if (!item.roles.includes(role)) {
    return null;
  }

  const children = item.children
    ?.map((child) => selectVisibleItem(child, role))
    .filter((child): child is NavigationItem => child !== null);

  return {
    ...item,
    breadcrumbs: cloneBreadcrumbs(item.breadcrumbs),
    children: children?.length ? children : undefined,
    roles: [...item.roles],
  };
}

function flattenNavigation(items: NavigationItem[]): NavigationItem[] {
  return items.flatMap((item) => [
    item,
    ...(item.children ? flattenNavigation(item.children) : []),
  ]);
}

function findItemByPath(
  items: NavigationItem[],
  pathname: string,
): NavigationItem | null {
  const matchedUrl = getBestMatch(
    pathname,
    flattenNavigation(items).map((item) => item.href),
  );

  if (!matchedUrl) {
    return null;
  }

  for (const item of items) {
    if (normalizePathname(item.href) === normalizePathname(matchedUrl)) {
      return item;
    }

    if (!item.children) {
      continue;
    }

    const childMatch = findItemByPath(item.children, pathname);

    if (childMatch) {
      return childMatch;
    }
  }

  return null;
}

export function getVisibleNavigation(role: UserRole): NavigationItem[] {
  return navigationRegistry
    .map((item) => selectVisibleItem(item, role))
    .filter((item): item is NavigationItem => item !== null);
}

export function getBreadcrumbsForPath(
  pathname: string,
  role: UserRole,
): NavigationBreadcrumb[] {
  const navigationItem = findItemByPath(
    getVisibleNavigation(role),
    normalizePathname(pathname),
  );

  return navigationItem ? cloneBreadcrumbs(navigationItem.breadcrumbs) : [];
}
