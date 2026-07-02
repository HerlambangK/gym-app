"use client"

import * as React from "react"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { AppSidebar } from "@/components/app-sidebar"
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"
import type { RoleCode } from "@/types/domain"

export function DashboardShell({
  role,
  title,
  userName,
  userEmail,
  children,
}: {
  role: RoleCode
  title: string
  userName: string
  userEmail: string
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <AppSidebar role={role} userName={userName} userEmail={userEmail} />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/90 px-3 backdrop-blur transition-[width,height] ease-linear sm:h-16 sm:px-4 group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex min-w-0 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 data-vertical:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="max-w-[58vw] truncate font-semibold">{title}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground sm:flex">
            <span className="size-2 rounded-full bg-emerald-500" />
            {role}
          </div>
        </header>
        <div className="flex-1 p-2.5 sm:p-5 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
