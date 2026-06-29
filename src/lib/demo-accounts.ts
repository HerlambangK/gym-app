import type { RoleCode } from "@/types/domain"

export type DemoAccount = {
  role: Extract<RoleCode, "OWNER" | "ADMIN" | "MEMBER">
  label: string
  name: string
  email: string
  password: string
  dashboardPath: string
}

export const demoAccounts: DemoAccount[] = [
  {
    role: "OWNER",
    label: "Owner Demo",
    name: "Owner ForgeFit",
    email: "owner@gym.test",
    password: "OwnerDemo123!",
    dashboardPath: "/owner/dashboard",
  },
  {
    role: "ADMIN",
    label: "Admin Demo",
    name: "Admin Front Desk",
    email: "admin@gym.test",
    password: "AdminDemo123!",
    dashboardPath: "/admin/dashboard",
  },
  {
    role: "MEMBER",
    label: "Member Demo",
    name: "Member Demo",
    email: "member@gym.test",
    password: "MemberDemo123!",
    dashboardPath: "/member/dashboard",
  },
]
