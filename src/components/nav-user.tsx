"use client"

import Link from "next/link"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ChevronsUpDownIcon, LogOutIcon, UserIcon } from "lucide-react"
import { createBrowserSupabaseClient } from "@/lib/supabase"
import type { RoleCode } from "@/types/domain"

export function NavUser({
  user,
  role,
}: {
  user: {
    name: string
    email: string
  }
  role: RoleCode
}) {
  const initials = user.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user.email[0].toUpperCase()
  const profileHref =
    role === "MEMBER" ? "/member/profile" :
      role === "ADMIN" ? "/admin/settings" :
        "/owner/settings"

  async function handleLogout() {
    const supabase = createBrowserSupabaseClient()
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="h-14 rounded-xl border border-transparent px-2 aria-expanded:border-sidebar-border aria-expanded:bg-sidebar-accent"
              />
            }
          >
            <Avatar className="size-9">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
              <span className="truncate font-medium">{user.name}</span>
              <span className="truncate text-xs text-sidebar-foreground/70">{user.email}</span>
            </div>
            <ChevronsUpDownIcon className="ml-auto size-4 text-sidebar-foreground/70 group-data-[collapsible=icon]:hidden" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 p-2"
            side="top"
            align="start"
            sideOffset={8}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex min-w-0 items-center gap-3 rounded-lg bg-muted/60 px-2 py-2.5 text-left text-sm">
                  <Avatar className="size-10">
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <Link href={profileHref}>
              <DropdownMenuItem className="h-10 gap-2 px-2">
                <UserIcon />
                Profile
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="h-10 gap-2 px-2">
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
