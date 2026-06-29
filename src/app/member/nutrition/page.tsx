import { createServerSupabaseClient } from "@/lib/supabase-server"
import { getMemberByUserId } from "@/lib/db/members"
import { getNutritionLogs } from "@/lib/db/nutrition"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { redirect } from "next/navigation"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const member = await getMemberByUserId(user.id)
  const today = new Date().toISOString().split("T")[0]
  const logs = member ? await getNutritionLogs(member.id, 1) : []
  const todayLog = logs.find((l: Record<string, unknown>) => l.log_date === today)

  if (!todayLog) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nutrition Log</CardTitle>
          <CardDescription>Log your daily nutrition to track your progress. Feature available for Plus and Pro members.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No entry for today yet.</p>
        </CardContent>
      </Card>
    )
  }

  const log = todayLog as {
    calories: number; protein_gram: number; carbs_gram: number; water_ml: number
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Nutrition</CardTitle>
        <CardDescription>Feature gated for Plus and Pro members.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-4">
        {[
          ["Calories", log.calories || 0, Math.min(100, Math.round(((log.calories || 0) / 2500) * 100))],
          ["Protein (g)", log.protein_gram || 0, Math.min(100, Math.round(((log.protein_gram || 0) / 150) * 100))],
          ["Carbs (g)", log.carbs_gram || 0, Math.min(100, Math.round(((log.carbs_gram || 0) / 300) * 100))],
          ["Water (ml)", log.water_ml || 0, Math.min(100, Math.round(((log.water_ml || 0) / 3000) * 100))],
        ].map(([label, value, progress]) => (
          <div key={label as string} className="rounded-md border border-border p-4">
            <p className="text-sm text-muted-foreground">{label as string}</p>
            <p className="mt-2 text-2xl font-semibold">{value as number}</p>
            <Progress value={progress as number} className="mt-4" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
