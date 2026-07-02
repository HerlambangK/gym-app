import { redirect } from "next/navigation"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { NutritionForm } from "@/components/member/nutrition-form"
import { getMemberByUserId } from "@/lib/db/members"
import { getNutritionLogs, getNutritionTarget } from "@/lib/db/nutrition"
import { isFitnessProfileIncomplete } from "@/lib/member-fitness-profile"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const member = await getMemberByUserId(user.id)
  const today = new Date().toISOString().split("T")[0]
  const [logs, target] = member
    ? await Promise.all([getNutritionLogs(member.id, 14), getNutritionTarget(member.id)])
    : [[], null]

  return (
    <div className="space-y-6">
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
