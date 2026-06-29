"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { Dumbbell, LayoutDashboard, Users, CreditCard, Activity, Settings, ShieldCheck } from "lucide-react"
import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import type { RoleCode } from "@/types/domain"

export type SidebarNavItem = {
  title: string
  url: string
  icon: React.ReactNode
  isActive?: boolean
}

type AppSidebarData = {
  teams: { name: string; logo: React.ReactNode; plan: string }[]
  navMain: SidebarNavItem[]
  user: { name: string; email: string }
}

const navByRole: Record<RoleCode, SidebarNavItem[]> = {
  SUPER_ADMIN: [],
  OWNER: [
    { title: "Overview", url: "/owner/dashboard", icon: <LayoutDashboard /> },
    { title: "Financial", url: "/owner/financial", icon: <CreditCard /> },
    { title: "Members", url: "/owner/members", icon: <Users /> },
    { title: "Invoices", url: "/owner/invoices", icon: <CreditCard /> },
    { title: "Attendances", url: "/owner/attendances", icon: <Activity /> },
    { title: "Premium Features", url: "/owner/premium-features", icon: <ShieldCheck /> },
    { title: "Settings", url: "/owner/settings", icon: <Settings /> },
  ],
  MANAGER: [],
  ADMIN: [
    { title: "Dashboard", url: "/admin/dashboard", icon: <LayoutDashboard /> },
    { title: "Members", url: "/admin/members", icon: <Users /> },
    { title: "Payments", url: "/admin/payments", icon: <CreditCard /> },
    { title: "Invoices", url: "/admin/invoices", icon: <CreditCard /> },
    { title: "Attendances", url: "/admin/attendances", icon: <Activity /> },
    { title: "Manual Check-in", url: "/admin/check-in-manual", icon: <Activity /> },
    { title: "Premium Features", url: "/admin/premium-features", icon: <ShieldCheck /> },
    { title: "Settings", url: "/admin/settings", icon: <Settings /> },
  ],
  MARKETING: [],
  TRAINER: [],
  MEMBER: [
    { title: "Dashboard", url: "/member/dashboard", icon: <LayoutDashboard /> },
    { title: "Check-in", url: "/member/check-in", icon: <Activity /> },
    { title: "Billing", url: "/member/billing", icon: <CreditCard /> },
    { title: "Nutrition", url: "/member/nutrition", icon: <Activity /> },
    { title: "Workouts", url: "/member/workouts", icon: <Activity /> },
    { title: "Blog Premium", url: "/member/blog", icon: <ShieldCheck /> },
    { title: "Profile", url: "/member/profile", icon: <Settings /> },
  ],
}

export function AppSidebar({
  role,
  userName,
  userEmail,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  role: RoleCode
  userName: string
  userEmail: string
}) {
  const pathname = usePathname()
  const navItems = navByRole[role] || []

  const data: AppSidebarData = {
    teams: [{ name: "ForgeFit Studio", logo: <Dumbbell />, plan: "Gym Management" }],
    navMain: navItems.map((item) => ({
      ...item,
      isActive: pathname === item.url || pathname.startsWith(item.url + "/"),
    })),
    user: { name: userName, email: userEmail },
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="hidden md:flex">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
