import { expect, test } from "vitest";

import {
  getVisibleNavigation,
  type NavigationItem,
  navigationSectionRegistry,
  navigationUiLabels,
} from "~/lib/navigation";

import {
  getSidebarNavigation,
  type SidebarMainItem,
} from "./app-sidebar-data";

function collectNavigationUrls(items: NavigationItem[]): string[] {
  return items.flatMap((item) => [
    item.href,
    ...(item.children ? collectNavigationUrls(item.children) : []),
  ]);
}

function collectMainUrls(items: SidebarMainItem[]): string[] {
  return items.flatMap((item) => [
    ...item.items.map((subItem) => subItem.url),
  ]);
}

test("all authenticated users can see the dashboard navigation group", () => {
  const sidebar = getSidebarNavigation("user", "/dashboard");
  const visibleUrls = collectNavigationUrls(getVisibleNavigation("user"));

  expect(collectMainUrls(sidebar.main.items)).toEqual(visibleUrls);
  expect(sidebar.main.items.some((item) => item.url === "/dashboard")).toBe(true);
});

test("normal users do not see admin navigation items", () => {
  const sidebar = getSidebarNavigation("user", "/dashboard");

  expect(
    collectMainUrls(sidebar.main.items).some((url) => url.startsWith("/admin")),
  ).toBe(false);
  expect(sidebar.projects).toBeNull();
});

test("admins see the admin overview and menu pages", () => {
  const sidebar = getSidebarNavigation("admin", "/admin/menu");
  const adminUrls = collectMainUrls(sidebar.main.items);

  expect(adminUrls.includes("/admin")).toBe(true);
  expect(adminUrls.includes("/admin/menu")).toBe(true);
});

test("admin navigation is split between main and lower sections", () => {
  const sidebar = getSidebarNavigation("admin", "/dashboard");

  expect(
    sidebar.main.items.map((item) => item.title),
  ).toEqual(["Dashboard", navigationSectionRegistry.administration.label]);
  expect(sidebar.main.label).toBe(navigationSectionRegistry.platform.label);
  expect(sidebar.projects?.label).toBe(navigationSectionRegistry.administration.label);
  expect(
    sidebar.projects?.items.map((item) => item.name),
  ).toEqual(["Menu"]);
});

test("pathname-driven active state opens the administration group for admin menu", () => {
  const sidebar = getSidebarNavigation("admin", "/admin/menu/");
  const dashboardItem = sidebar.main.items.find((item) => item.url === "/dashboard");
  const adminItem = sidebar.main.items.find((item) => item.url === "/admin");

  expect(dashboardItem).toBeTruthy();
  expect(adminItem).toBeTruthy();

  if (!dashboardItem || !adminItem) {
    throw new Error("Expected dashboard and admin sidebar items to exist.");
  }

  expect(dashboardItem.isActive).toBe(false);
  expect(dashboardItem.isOpen).toBe(false);
  expect(adminItem.isActive).toBe(true);
  expect(adminItem.isOpen).toBe(true);
  expect(
    adminItem.items.map((item) => ({
      isActive: item.isActive,
      title: item.title,
      url: item.url,
    })),
  ).toEqual([
      {
        isActive: false,
        title: navigationUiLabels.overview,
        url: "/admin",
      },
      { isActive: true, title: "Menu", url: "/admin/menu" },
    ]);
  expect(
    sidebar.projects?.items.map((item) => ({
      isActive: item.isActive,
      name: item.name,
      url: item.url,
    })),
  ).toEqual([{ isActive: true, name: "Menu", url: "/admin/menu" }]);
});
