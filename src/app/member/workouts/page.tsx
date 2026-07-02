import { redirect } from "next/navigation"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { WorkoutTreeForm } from "@/components/member/workout-tree-form"
import { getMemberByUserId } from "@/lib/db/members"
import { getNutritionTarget } from "@/lib/db/nutrition"
import { getActiveWorkoutProgram } from "@/lib/db/workouts"
import { isFitnessProfileIncomplete, parseWorkoutNotes } from "@/lib/member-fitness-profile"
import { createServerSupabaseClient } from "@/lib/supabase-server"

export default async function Page() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const member = await getMemberByUserId(user.id)
  const [program, target] = member
    ? await Promise.all([getActiveWorkoutProgram(member.id), getNutritionTarget(member.id).catch(() => null)])
    : [null, null]
  const workoutProfile = parseWorkoutNotes(target?.notes)
  const profileIncomplete = isFitnessProfileIncomplete(target)

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        eyebrow="Workout"
        status="Plan + Progress"
        title="Workout Coach"
        description="Onboarding latihan, template program, exercise library, preview mingguan, dan rekomendasi progres yang mudah dipakai member."
      />
      <WorkoutTreeForm program={program} profile={workoutProfile} profileIncomplete={profileIncomplete} />
    </div>
  )
}
