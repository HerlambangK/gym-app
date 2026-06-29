import { redirect } from "next/navigation"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { ProfileForm } from "@/components/member/profile-form"
import { getMemberByUserId } from "@/lib/db/members"
import { getUserById } from "@/lib/db/users"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const [profile, member] = await Promise.all([
    getUserById(user.id).catch(() => null),
    getMemberByUserId(user.id),
  ])

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Profile"
        status={user.email_confirmed_at ? "Verified" : "Unverified"}
        title="Setting Profile"
        description="Kelola identitas member, kontak, status akun, dan informasi membership."
      />
      <ProfileForm
        profile={profile}
        member={member}
        email={user.email || ""}
        verified={Boolean(user.email_confirmed_at)}
      />
    </div>
  )
}
