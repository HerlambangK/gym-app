import { redirect } from "next/navigation"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { WorkoutTreeForm } from "@/components/member/workout-tree-form"
import { getMemberByUserId } from "@/lib/db/members"
import { getActiveWorkoutProgram } from "@/lib/db/workouts"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const member = await getMemberByUserId(user.id)
  const program = member ? await getActiveWorkoutProgram(member.id) : null

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Workout"
        status="Tree Program"
        title="Program Latihan"
        description="Buat program latihan bertingkat berdasarkan hari, jenis latihan, jumlah set, repetisi, dan catatan beban."
      />
      <WorkoutTreeForm program={program} />
    </div>
  )
}
