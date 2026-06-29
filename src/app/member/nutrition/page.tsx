import { redirect } from "next/navigation"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { NutritionForm } from "@/components/member/nutrition-form"
import { getMemberByUserId } from "@/lib/db/members"
import { getNutritionLogs, getNutritionTarget } from "@/lib/db/nutrition"
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
        status="Plus / Pro"
        title="Target Nutrisi"
        description="Pantau makanan, kalori masuk, target BMI, target berat, dan target kalori harian dalam satu layar."
      />
      <NutritionForm today={today} logs={logs} target={target} />
    </div>
  )
}
