import { redirect } from "next/navigation"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { NutritionForm } from "@/components/member/nutrition-form"
import { getMemberByUserId } from "@/lib/db/members"
import { getNutritionLogs, getNutritionTarget } from "@/lib/db/nutrition"
import { isFitnessProfileIncomplete } from "@/lib/member-fitness-profile"
import { getCurrentUserId } from "@/lib/current-user"

export default async function Page() {
  const userId = await getCurrentUserId()
  if (!userId) redirect("/login")

  const member = await getMemberByUserId(userId)
  const today = new Date().toISOString().split("T")[0]
  const [logs, target] = member
    ? await Promise.all([getNutritionLogs(member.id, 14), getNutritionTarget(member.id)])
    : [[], null]

  return (
    <div className="space-y-3 sm:space-y-6">
      <DashboardPageHeader
        eyebrow="Nutrition"
        status="Diary + Smart Target"
        title="Nutrition Coach"
        description="Onboarding target, food diary per waktu makan, rekomendasi menu lokal Indonesia, dan progress kalori/makro harian."
      />
      <NutritionForm
        today={today}
        logs={logs}
        target={target}
        profileIncomplete={isFitnessProfileIncomplete(target)}
      />
    </div>
  )
}
