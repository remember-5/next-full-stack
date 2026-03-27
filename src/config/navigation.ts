import type { UserRole } from "~/server/better-auth/config";

export type NavigationBreadcrumb = {
  href: string;
  label: string;
};

export type NavigationSection = "administration" | "platform";

export type NavigationIcon = "dashboard" | "settings" | "shield";

export const navigationSectionRegistry = {
  administration: {
    label: "Administration",
  },
  platform: {
    label: "Platform",
  },
} satisfies Record<NavigationSection, { label: string }>;

export const navigationUiLabels = {
  overview: "Overview",
} as const;

export type NavigationItem = {
  id: string;
  title: string;
  href: string;
  section: NavigationSection;
  roles: UserRole[];
  breadcrumbs: NavigationBreadcrumb[];
  children?: NavigationItem[];
  icon?: NavigationIcon;
};

export const navigationRegistry: NavigationItem[] = [
  {
    breadcrumbs: [{ href: "/dashboard", label: "Dashboard" }],
    href: "/dashboard",
    icon: "dashboard",
    id: "dashboard",
    roles: ["user", "admin"],
    section: "platform",
    title: "Dashboard",
  },
  {
    breadcrumbs: [{ href: "/admin", label: "Admin" }],
    children: [
      {
        breadcrumbs: [
          { href: "/admin", label: "Admin" },
          { href: "/admin/menu", label: "Menu" },
        ],
        href: "/admin/menu",
        icon: "settings",
        id: "admin-menu",
        roles: ["admin"],
        section: "administration",
        title: "Menu",
      },
    ],
    href: "/admin",
    icon: "shield",
    id: "admin",
    roles: ["admin"],
    section: "administration",
    title: "Admin",
  },
];
