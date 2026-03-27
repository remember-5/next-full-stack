import * as React from "react";
import {
  GalleryVerticalEndIcon,
  LayoutDashboardIcon,
  Settings2Icon,
  ShieldIcon,
  type LucideIcon,
} from "lucide-react";

import {
  navigationSectionRegistry,
  navigationUiLabels,
} from "~/config/navigation";
import type {
  NavigationIcon,
  NavigationItem,
} from "~/config/navigation";
import { getBestMatch, getVisibleNavigation } from "~/lib/navigation";
import type { UserRole } from "~/server/better-auth/config";

export type SidebarMainSubItem = {
  isActive: boolean;
  title: string;
  url: string;
};

export type SidebarMainItem = {
  icon?: React.ReactNode;
  id: string;
  isActive: boolean;
  isOpen: boolean;
  items: SidebarMainSubItem[];
  stateKey: string;
  title: string;
  url: string;
};

export type SidebarMainSection = {
  items: SidebarMainItem[];
  label: string;
};

export type SidebarProjectItem = {
  icon?: React.ReactNode;
  id: string;
  isActive: boolean;
  name: string;
  url: string;
};

export type SidebarProjectSection = {
  items: SidebarProjectItem[];
  label: string;
};

export type SidebarNavigation = {
  main: SidebarMainSection;
  projects: SidebarProjectSection | null;
};

const iconMap = {
  dashboard: LayoutDashboardIcon,
  settings: Settings2Icon,
  shield: ShieldIcon,
} satisfies Record<NavigationIcon, LucideIcon>;

function mapSidebarIcon(icon?: NavigationIcon): React.ReactNode | undefined {
  if (!icon) {
    return undefined;
  }

  const Icon = iconMap[icon];

  return <Icon />;
}

function createMainSubItems(
  item: NavigationItem,
  pathname: string,
): SidebarMainSubItem[] {
  const links = [
    { title: navigationUiLabels.overview, url: item.href },
    ...(item.children?.map((child) => ({
      title: child.title,
      url: child.href,
    })) ?? []),
  ];
  const activeUrl = getBestMatch(
    pathname,
    links.map((link) => link.url),
  );

  return links.map((link) => ({
    ...link,
    isActive: link.url === activeUrl,
  }));
}

function createMainItem(
  item: NavigationItem,
  pathname: string,
  title = item.title,
): SidebarMainItem {
  const items = createMainSubItems(item, pathname);
  const stateKey =
    getBestMatch(
      pathname,
      [item.href, ...items.map((subItem) => subItem.url)],
    ) ?? "closed";
  const isActive = stateKey !== "closed";

  return {
    icon: mapSidebarIcon(item.icon),
    id: item.id,
    isActive,
    isOpen: isActive,
    items,
    stateKey,
    title,
    url: item.href,
  };
}

function createProjectItems(
  items: NavigationItem[],
  pathname: string,
): SidebarProjectItem[] {
  const projectLinks = items.flatMap((item) =>
    (item.children ?? []).map((child) => ({
      icon: mapSidebarIcon(child.icon ?? item.icon),
      id: child.id,
      name: child.title,
      url: child.href,
    })),
  );
  const activeUrl = getBestMatch(
    pathname,
    projectLinks.map((item) => item.url),
  );

  return projectLinks.map((item) => ({
      ...item,
      isActive: item.url === activeUrl,
    }));
}

export function getSidebarNavigation(
  role: UserRole,
  pathname: string,
): SidebarNavigation {
  const visibleNavigation = getVisibleNavigation(role);
  const platformItems = visibleNavigation.filter(
    (item) => item.section === "platform",
  );
  const administrationItems = visibleNavigation.filter(
    (item) => item.section === "administration",
  );
  const administrationTitle =
    administrationItems.length === 1
      ? navigationSectionRegistry.administration.label
      : undefined;
  const mainItems = [
    ...platformItems.map((item) => createMainItem(item, pathname)),
    ...administrationItems.map((item) =>
      createMainItem(item, pathname, administrationTitle ?? item.title),
    ),
  ];
  const projectItems = createProjectItems(administrationItems, pathname);

  return {
    main: {
      items: mainItems,
      label: navigationSectionRegistry.platform.label,
    },
    projects: projectItems.length
      ? {
          items: projectItems,
          label: navigationSectionRegistry.administration.label,
        }
      : null,
  };
}

export function getSidebarTeams() {
  return [
    {
      logo: <GalleryVerticalEndIcon />,
      name: "Remember5",
      plan: "Workspace",
    },
  ];
}
