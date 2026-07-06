import { redirect } from "next/navigation"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { ProfileForm } from "@/components/member/profile-form"
import { getMemberByUserId } from "@/lib/db/members"
import { getNutritionTarget } from "@/lib/db/nutrition"
import { getUserById } from "@/lib/db/users"
import { getCurrentUserId, getCurrentUserEmail, getCurrentUserVerified } from "@/lib/current-user"

export default async function Page() {
  const userId = await getCurrentUserId()
  if (!userId) redirect("/login")

  const [profile, member, email, verified] = await Promise.all([
    getUserById(userId).catch(() => null),
    getMemberByUserId(userId),
    getCurrentUserEmail(),
    getCurrentUserVerified(),
  ])
  const target = member ? await getNutritionTarget(member.id).catch(() => null) : null

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Profile"
        status={verified ? "Verified" : "Unverified"}
        title="Setting Profile"
        description="Kelola identitas member, kontak, status akun, dan informasi membership."
      />
      <ProfileForm
        profile={profile}
        member={member}
        target={target}
        email={email || ""}
        verified={verified}
      />
    </div>
  )
}
