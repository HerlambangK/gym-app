import { getCurrentUserId } from "@/lib/current-user"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { getBrandingSettings } from "@/lib/db/branding"
import { getUserById } from "@/lib/db/users"
import { redirect } from "next/navigation"

async function getCurrentUser() {
  const userId = await getCurrentUserId()
  if (!userId) redirect("/login")
  return { id: userId }
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

async function getUserProfile(authUser: { id: string; email?: string | null; user_metadata?: { name?: string } }) {
  try {
    const profile = await getUserById(authUser.id)
    return {
      userName: profile.name || authUser.user_metadata?.name || authUser.email || "",
      userEmail: profile.email || authUser.email || "",
    }
  } catch {
    return {
      userName: authUser.user_metadata?.name as string || authUser.email || "",
      userEmail: authUser.email || "",
    }
  }
}

export async function OwnerShell({ children }: { children: React.ReactNode }) {
  const [user, branding] = await Promise.all([getCurrentUser(), getBranding()])
  const profile = await getUserProfile(user)
  return (
    <DashboardShell
      role="OWNER"
      title="Owner Dashboard"
      userName={profile.userName}
      userEmail={profile.userEmail}
      brandName={branding.brandName}
      brandLogoUrl={branding.brandLogoUrl}
    >
      {children}
    </DashboardShell>
  )
}

export async function AdminShell({ children }: { children: React.ReactNode }) {
  const [user, branding] = await Promise.all([getCurrentUser(), getBranding()])
  const profile = await getUserProfile(user)
  return (
    <DashboardShell
      role="ADMIN"
      title="Admin Panel"
      userName={profile.userName}
      userEmail={profile.userEmail}
      brandName={branding.brandName}
      brandLogoUrl={branding.brandLogoUrl}
    >
      {children}
    </DashboardShell>
  )
}

export async function MemberShell({ children }: { children: React.ReactNode }) {
  const [user, branding] = await Promise.all([getCurrentUser(), getBranding()])
  const profile = await getUserProfile(user)
  return (
    <DashboardShell
      role="MEMBER"
      title="Member Portal"
      userName={profile.userName}
      userEmail={profile.userEmail}
      brandName={branding.brandName}
      brandLogoUrl={branding.brandLogoUrl}
    >
      {children}
    </DashboardShell>
  )
}
