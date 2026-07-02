import { createServerSupabaseClient } from "@/lib/supabase-server"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getBrandingSettings } from "@/lib/db/branding"
import { redirect } from "next/navigation"

async function getCurrentUser() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")
  return user
}

async function getBranding() {
  try {
    const branding = await getBrandingSettings()
    return {
      brandName: branding?.brand_name || undefined,
      brandLogoUrl: branding?.logo_url || undefined,
    }
  } catch {
    return { brandName: undefined, brandLogoUrl: undefined }
  }
}

export async function OwnerShell({ children }: { children: React.ReactNode }) {
  const [user, branding] = await Promise.all([getCurrentUser(), getBranding()])
  return (
    <DashboardShell
      role="OWNER"
      title="Owner Dashboard"
      userName={user.user_metadata?.name as string || user.email || ""}
      userEmail={user.email || ""}
      brandName={branding.brandName}
      brandLogoUrl={branding.brandLogoUrl}
    >
      {children}
    </DashboardShell>
  )
}

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const [user, branding] = await Promise.all([getCurrentUser(), getBranding()])
  return (
    <DashboardShell
      role="ADMIN"
      title="Admin Panel"
      userName={user.user_metadata?.name as string || user.email || ""}
      userEmail={user.email || ""}
      brandName={branding.brandName}
      brandLogoUrl={branding.brandLogoUrl}
    >
      {children}
    </DashboardShell>
  )
}

export async function MemberShell({ children }: { children: React.ReactNode }) {
  const [user, branding] = await Promise.all([getCurrentUser(), getBranding()])
  return (
    <DashboardShell
      role="MEMBER"
      title="Member Portal"
      userName={user.user_metadata?.name as string || user.email || ""}
      userEmail={user.email || ""}
      brandName={branding.brandName}
      brandLogoUrl={branding.brandLogoUrl}
    >
      {children}
    </DashboardShell>
  )
}
