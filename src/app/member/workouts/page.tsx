import { redirect } from "next/navigation"
import { DashboardPageHeader } from "@/components/dashboard/page-header"
import { WorkoutTreeForm } from "@/components/member/workout-tree-form"
import { getMemberByUserId } from "@/lib/db/members"
import { getNutritionTarget } from "@/lib/db/nutrition"
import { getActiveWorkoutProgram } from "@/lib/db/workouts"
import { isFitnessProfileIncomplete, parseWorkoutNotes } from "@/lib/member-fitness-profile"
import { getCurrentUserId } from "@/lib/current-user"

export default async function Page() {
  const userId = await getCurrentUserId()
  if (!userId) redirect("/login")

  const member = await getMemberByUserId(userId)
  const [program, target] = member
    ? await Promise.all([getActiveWorkoutProgram(member.id), getNutritionTarget(member.id).catch(() => null)])
    : [null, null]
  const workoutProfile = parseWorkoutNotes(target?.notes)
  const profileIncomplete = isFitnessProfileIncomplete(target)
  if (!target?.gender) redirect("/member/profile?next=/member/workouts&missing=gender")

  return (
    <div className="space-y-3 sm:space-y-6">
      <DashboardPageHeader
        eyebrow="Workout"
        status="Plan + Progress"
        title="Workout Coach"
        description="Onboarding latihan, template program, exercise library, preview mingguan, dan rekomendasi progres yang mudah dipakai member."
      />
      <WorkoutTreeForm
        program={program}
        profile={workoutProfile}
        profileIncomplete={profileIncomplete}
        gender={target.gender}
      />
    </div>
  )
}
