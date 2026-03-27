"use client"

import Link from "next/link"
import * as React from "react"
import { ChevronRightIcon } from "lucide-react"

import type { SidebarMainSection } from "~/components/app-sidebar-data"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenuAction,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "~/components/ui/sidebar"

export function NavMain({
  section,
}: {
  section: SidebarMainSection
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
      <SidebarMenu>
        {section.items.map((item) => (
          <Collapsible
            key={`${item.id}-${item.stateKey}`}
            asChild
            className="group/collapsible"
            defaultOpen={item.isOpen}
          >
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                data-item-id={item.id}
                isActive={item.isActive}
                tooltip={item.title}
              >
                <Link href={item.url}>
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
              {item.items.length > 1 ? (
                <CollapsibleTrigger asChild>
                  <SidebarMenuAction data-item-id={item.id} showOnHover>
                    <ChevronRightIcon className="transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    <span className="sr-only">Toggle {item.title}</span>
                  </SidebarMenuAction>
                </CollapsibleTrigger>
              ) : null}
              <CollapsibleContent>
                <SidebarMenuSub>
                  {item.items.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.url}>
                      <SidebarMenuSubButton asChild isActive={subItem.isActive}>
                        <Link href={subItem.url}>
                          <span>{subItem.title}</span>
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
