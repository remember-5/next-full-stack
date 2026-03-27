"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Fragment } from "react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import { getBreadcrumbsForPath } from "~/lib/navigation"

type AppBreadcrumbsProps = {
  role: "admin" | "user"
}

export function AppBreadcrumbs({ role }: AppBreadcrumbsProps) {
  const pathname = usePathname()
  const breadcrumbs = getBreadcrumbsForPath(pathname, role)

  if (breadcrumbs.length === 0) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb, index) => {
          const isCurrentPage = index === breadcrumbs.length - 1

          return (
            <Fragment key={breadcrumb.href}>
              <BreadcrumbItem className={isCurrentPage ? undefined : "hidden md:block"}>
                {isCurrentPage ? (
                  <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {isCurrentPage ? null : (
                <BreadcrumbSeparator className="hidden md:block" />
              )}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
