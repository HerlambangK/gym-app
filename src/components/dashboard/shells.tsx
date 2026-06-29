import { createServerSupabaseClient } from "@/lib/supabase-server"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { redirect } from "next/navigation"

async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  return user
}

export async function OwnerShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  return (
    <DashboardShell
      role="OWNER"
      title="Owner Dashboard"
      userName={user.user_metadata?.name as string || user.email || ""}
      userEmail={user.email || ""}
    >
      {children}
    </DashboardShell>
  )
}

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  return (
    <DashboardShell
      role="ADMIN"
      title="Admin Panel"
      userName={user.user_metadata?.name as string || user.email || ""}
      userEmail={user.email || ""}
    >
      {children}
    </DashboardShell>
  )
}

export async function MemberShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()
  return (
    <DashboardShell
      role="MEMBER"
      title="Member Portal"
      userName={user.user_metadata?.name as string || user.email || ""}
      userEmail={user.email || ""}
    >
      {children}
    </DashboardShell>
  )
}
