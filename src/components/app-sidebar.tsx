"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { getSidebarNavigation, getSidebarTeams } from "~/components/app-sidebar-data"
import { NavMain } from "~/components/nav-main"
import { NavProjects } from "~/components/nav-projects"
import { NavUser } from "~/components/nav-user"
import { TeamSwitcher } from "~/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar"
import type { UserRole } from "~/server/better-auth/config"

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  signOutSlot?: React.ReactNode
  user: {
    avatar?: string | null
    email: string
    name: string
    role: UserRole
  }
}

export function AppSidebar({
  signOutSlot,
  user,
  ...props
}: AppSidebarProps) {
  const pathname = usePathname()
  const navigation = getSidebarNavigation(user.role, pathname)
  const teams = getSidebarTeams()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain section={navigation.main} />
        <NavProjects section={navigation.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          signOutSlot={signOutSlot}
          user={{
            avatar: user.avatar ?? undefined,
            email: user.email,
            name: user.name,
            role: user.role,
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
