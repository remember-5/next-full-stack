import { expect, test } from "vitest";

import {
  getBreadcrumbsForPath,
  getVisibleNavigation,
  type NavigationItem,
} from "./navigation";

function collectHrefs(items: NavigationItem[]): string[] {
  return items.flatMap((item) => [
    item.href,
    ...(item.children ? collectHrefs(item.children) : []),
  ]);
}

test("normal users only see the dashboard route", () => {
  const hrefs = collectHrefs(getVisibleNavigation("user"));

  expect(hrefs).toEqual(["/dashboard"]);
});

test("admins see the dashboard, admin, and admin menu routes", () => {
  const hrefs = collectHrefs(getVisibleNavigation("admin"));

  expect(hrefs).toEqual(["/dashboard", "/admin", "/admin/menu"]);
});

test("dashboard breadcrumbs resolve to a single dashboard crumb", () => {
  expect(getBreadcrumbsForPath("/dashboard", "user")).toEqual([
    { href: "/dashboard", label: "Dashboard" },
  ]);
});

test("admin breadcrumbs resolve to a single admin crumb for admins", () => {
  expect(getBreadcrumbsForPath("/admin", "admin")).toEqual([
    { href: "/admin", label: "Admin" },
  ]);
});

test("admin menu breadcrumbs resolve to admin then menu", () => {
  expect(getBreadcrumbsForPath("/admin/menu", "admin")).toEqual([
    { href: "/admin", label: "Admin" },
    { href: "/admin/menu", label: "Menu" },
  ]);
});

test("normal users cannot resolve admin breadcrumbs", () => {
  expect(getBreadcrumbsForPath("/admin/menu", "user")).toEqual([]);
});

test("unknown authenticated routes do not resolve breadcrumbs", () => {
  expect(getBreadcrumbsForPath("/settings", "user")).toEqual([]);
  expect(getBreadcrumbsForPath("/settings", "admin")).toEqual([]);
});

test("breadcrumb lookup normalizes trailing slashes for visible routes", () => {
  expect(getBreadcrumbsForPath("/dashboard/", "user")).toEqual([
    { href: "/dashboard", label: "Dashboard" },
  ]);
});

test("breadcrumb lookup uses the closest visible registered parent path", () => {
  expect(getBreadcrumbsForPath("/admin/menu/details", "admin")).toEqual([
    { href: "/admin", label: "Admin" },
    { href: "/admin/menu", label: "Menu" },
  ]);
});
