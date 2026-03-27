import assert from "node:assert/strict";
import test from "node:test";

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

void test("normal users only see the dashboard route", () => {
  const hrefs = collectHrefs(getVisibleNavigation("user"));

  assert.deepEqual(hrefs, ["/dashboard"]);
});

void test("admins see the dashboard, admin, and admin menu routes", () => {
  const hrefs = collectHrefs(getVisibleNavigation("admin"));

  assert.deepEqual(hrefs, ["/dashboard", "/admin", "/admin/menu"]);
});

void test("dashboard breadcrumbs resolve to a single dashboard crumb", () => {
  assert.deepEqual(getBreadcrumbsForPath("/dashboard", "user"), [
    { href: "/dashboard", label: "Dashboard" },
  ]);
});

void test("admin breadcrumbs resolve to a single admin crumb for admins", () => {
  assert.deepEqual(getBreadcrumbsForPath("/admin", "admin"), [
    { href: "/admin", label: "Admin" },
  ]);
});

void test("admin menu breadcrumbs resolve to admin then menu", () => {
  assert.deepEqual(getBreadcrumbsForPath("/admin/menu", "admin"), [
    { href: "/admin", label: "Admin" },
    { href: "/admin/menu", label: "Menu" },
  ]);
});

void test("normal users cannot resolve admin breadcrumbs", () => {
  assert.deepEqual(getBreadcrumbsForPath("/admin/menu", "user"), []);
});

void test("unknown authenticated routes do not resolve breadcrumbs", () => {
  assert.deepEqual(getBreadcrumbsForPath("/settings", "user"), []);
  assert.deepEqual(getBreadcrumbsForPath("/settings", "admin"), []);
});

void test("breadcrumb lookup normalizes trailing slashes for visible routes", () => {
  assert.deepEqual(getBreadcrumbsForPath("/dashboard/", "user"), [
    { href: "/dashboard", label: "Dashboard" },
  ]);
});

void test("breadcrumb lookup uses the closest visible registered parent path", () => {
  assert.deepEqual(getBreadcrumbsForPath("/admin/menu/details", "admin"), [
    { href: "/admin", label: "Admin" },
    { href: "/admin/menu", label: "Menu" },
  ]);
});
