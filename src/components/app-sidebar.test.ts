import * as React from "react";
import assert from "node:assert/strict";
import test from "node:test";

import {
  SidebarMenuAction,
  SidebarMenuButton,
} from "~/components/ui/sidebar";
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
import { NavMain } from "./nav-main";
import { Collapsible } from "~/components/ui/collapsible";

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

function isElementWithChildren(
  value: React.ReactNode,
): value is React.ReactElement<{ children?: React.ReactNode }> {
  return React.isValidElement<{ children?: React.ReactNode }>(value);
}

function isElementOfType<TProps extends { children?: React.ReactNode }>(
  value: React.ReactNode,
  type: unknown,
): value is React.ReactElement<TProps> {
  return React.isValidElement<TProps>(value) && value.type === type;
}

function collectElementsByType<TProps extends { children?: React.ReactNode }>(
  node: React.ReactNode,
  type: unknown,
): React.ReactElement<TProps>[] {
  const elements: React.ReactElement<TProps>[] = [];

  function visit(value: React.ReactNode) {
    React.Children.forEach(value, (child) => {
      if (isElementOfType<TProps>(child, type)) {
        elements.push(child);
      }

      if (isElementWithChildren(child)) {
        visit(child.props.children);
      }
    });
  }
  visit(node);

  return elements;
}

function getDataItemId(value: unknown) {
  return (value as Record<string, unknown>)["data-item-id"];
}

function getHrefFromElementChild(
  child: React.ReactNode,
): string | undefined {
  if (!isElementWithChildren(child)) {
    return undefined;
  }

  return (child.props as { href?: string }).href;
}

void test("all authenticated users can see the dashboard navigation group", () => {
  const sidebar = getSidebarNavigation("user", "/dashboard");
  const visibleUrls = collectNavigationUrls(getVisibleNavigation("user"));

  assert.deepEqual(collectMainUrls(sidebar.main.items), visibleUrls);
  assert.equal(sidebar.main.items.some((item) => item.url === "/dashboard"), true);
});

void test("normal users do not see admin navigation items", () => {
  const sidebar = getSidebarNavigation("user", "/dashboard");

  assert.equal(
    collectMainUrls(sidebar.main.items).some((url) => url.startsWith("/admin")),
    false,
  );
  assert.equal(sidebar.projects, null);
});

void test("admins see the admin overview and menu pages", () => {
  const sidebar = getSidebarNavigation("admin", "/admin/menu");
  const adminUrls = collectMainUrls(sidebar.main.items);

  assert.equal(adminUrls.includes("/admin"), true);
  assert.equal(adminUrls.includes("/admin/menu"), true);
});

void test("admin navigation is split between main and lower sections", () => {
  const sidebar = getSidebarNavigation("admin", "/dashboard");

  assert.deepEqual(
    sidebar.main.items.map((item) => item.title),
    ["Dashboard", navigationSectionRegistry.administration.label],
  );
  assert.equal(sidebar.main.label, navigationSectionRegistry.platform.label);
  assert.equal(sidebar.projects?.label, navigationSectionRegistry.administration.label);
  assert.deepEqual(
    sidebar.projects?.items.map((item) => item.name),
    ["Menu"],
  );
});

void test("pathname-driven active state opens the administration group for admin menu", () => {
  const sidebar = getSidebarNavigation("admin", "/admin/menu/");
  const dashboardItem = sidebar.main.items.find((item) => item.url === "/dashboard");
  const adminItem = sidebar.main.items.find((item) => item.url === "/admin");

  assert.ok(dashboardItem);
  assert.ok(adminItem);
  assert.equal(dashboardItem.isActive, false);
  assert.equal(dashboardItem.isOpen, false);
  assert.equal(adminItem.isActive, true);
  assert.equal(adminItem.isOpen, true);
  assert.deepEqual(
    adminItem.items.map((item) => ({
      isActive: item.isActive,
      title: item.title,
      url: item.url,
    })),
    [
      {
        isActive: false,
        title: navigationUiLabels.overview,
        url: "/admin",
      },
      { isActive: true, title: "Menu", url: "/admin/menu" },
    ],
  );
  assert.deepEqual(
    sidebar.projects?.items.map((item) => ({
      isActive: item.isActive,
      name: item.name,
      url: item.url,
    })),
    [{ isActive: true, name: "Menu", url: "/admin/menu" }],
  );
});

void test("nav main seeds collapsibles from route state without controlling user toggles", () => {
  const dashboardTree = NavMain({
    section: getSidebarNavigation("admin", "/dashboard").main,
  });
  const adminMenuTree = NavMain({
    section: getSidebarNavigation("admin", "/admin/menu").main,
  });
  const dashboardCollapsibles = collectElementsByType<
    React.ComponentProps<typeof Collapsible>
  >(dashboardTree, Collapsible);
  const adminMenuCollapsibles = collectElementsByType<
    React.ComponentProps<typeof Collapsible>
  >(adminMenuTree, Collapsible);
  const dashboardAdminCollapsible = dashboardCollapsibles.find(
    (element) => String(element.key).startsWith("admin"),
  );
  const adminMenuAdminCollapsible = adminMenuCollapsibles.find(
    (element) => String(element.key).startsWith("admin"),
  );

  assert.ok(dashboardAdminCollapsible);
  assert.ok(adminMenuAdminCollapsible);
  assert.equal("open" in dashboardAdminCollapsible.props, false);
  assert.equal("open" in adminMenuAdminCollapsible.props, false);
  assert.equal(dashboardAdminCollapsible.props.defaultOpen, false);
  assert.equal(adminMenuAdminCollapsible.props.defaultOpen, true);
  assert.notEqual(dashboardAdminCollapsible.key, adminMenuAdminCollapsible.key);
});

void test("nav main renders top-level items as links with a separate toggle action", () => {
  const adminTree = NavMain({
    section: getSidebarNavigation("admin", "/dashboard").main,
  });
  const menuButtons = collectElementsByType<
    React.ComponentProps<typeof SidebarMenuButton>
  >(adminTree, SidebarMenuButton);
  const menuActions = collectElementsByType<
    React.ComponentProps<typeof SidebarMenuAction>
  >(adminTree, SidebarMenuAction);
  const adminButton = menuButtons.find(
    (element) => getDataItemId(element.props) === "admin",
  );
  const adminAction = menuActions.find(
    (element) => getDataItemId(element.props) === "admin",
  );

  assert.ok(adminButton);
  assert.equal(adminButton.props.asChild, true);
  assert.ok(isElementWithChildren(adminButton.props.children));
  assert.equal(getHrefFromElementChild(adminButton.props.children), "/admin");
  assert.ok(adminAction);
});
