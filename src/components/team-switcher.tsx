"use client"

import * as React from "react"
import Image from "next/image"
import { Dumbbell } from "lucide-react"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export type TeamData = {
  name: string
  logo: React.ReactNode | string
  plan: string
}

export function TeamSwitcher({
  teams,
}: {
  teams: TeamData[]
}) {
  const activeTeam = teams[0]
  if (!activeTeam) return null

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" className="aria-expanded:bg-muted">
          <div className="flex aspect-square size-8 items-center justify-center overflow-hidden rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
            {typeof activeTeam.logo === "string" ? (
              <Image
                src={activeTeam.logo}
                alt={activeTeam.name}
                width={32}
                height={32}
                className="size-full object-cover"
              />
            ) : (
              activeTeam.logo ?? <Dumbbell size={18} />
            )}
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{activeTeam.name}</span>
            <span className="truncate text-xs">{activeTeam.plan}</span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
