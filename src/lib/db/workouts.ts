import { createAdminSupabaseClient } from "@/lib/supabase-server"

export type WorkoutExerciseInput = {
  dayName: string
  exerciseName: string
  exerciseType: string
  sets: number
  reps?: string
  loadNote?: string
}

function getClient() {
  return createAdminSupabaseClient()
}

export async function getActiveWorkoutProgram(memberId: string) {
  const supabase = await getClient()
  const { data, error } = await supabase
    .from("workout_programs")
    .select("id, title, goal, is_active, created_at, updated_at, workout_sessions(id, day_name, session_order, workout_exercises(id, exercise_name, exercise_type, sets, reps, load_note, exercise_order))")
    .eq("member_id", memberId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("getActiveWorkoutProgram error:", error)
    return null
  }

  return data
}

export async function replaceActiveWorkoutProgram(input: {
  memberId: string
  title: string
  goal?: string
  exercises: WorkoutExerciseInput[]
}) {
  const supabase = await getClient()

  await supabase
    .from("workout_programs")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("member_id", input.memberId)
    .eq("is_active", true)

  const { data: program, error: programError } = await supabase
    .from("workout_programs")
    .insert({
      member_id: input.memberId,
      title: input.title,
      goal: input.goal || null,
      is_active: true,
    })
    .select()
    .single()

  if (programError) throw programError

  const grouped = input.exercises.reduce<Record<string, WorkoutExerciseInput[]>>((acc, exercise) => {
    acc[exercise.dayName] ||= []
    acc[exercise.dayName].push(exercise)
    return acc
  }, {})

  const sessionInserts = Object.entries(grouped).map(([dayName], index) => ({
    program_id: program.id,
    day_name: dayName,
    session_order: index + 1,
  }))

  if (sessionInserts.length === 0) return program

  const { data: sessions, error: sessionsError } = await supabase
    .from("workout_sessions")
    .insert(sessionInserts)
    .select()

  if (sessionsError) throw sessionsError

  const exerciseInserts = sessions.flatMap((session, sessionIndex) => {
    const dayKey = Object.entries(grouped)[sessionIndex]
    if (!dayKey) return []
    return dayKey[1].map((exercise, index) => ({
      session_id: session.id,
      exercise_name: exercise.exerciseName,
      exercise_type: exercise.exerciseType,
      sets: exercise.sets,
      reps: exercise.reps || null,
      load_note: exercise.loadNote || null,
      exercise_order: index + 1,
    }))
  })

  if (exerciseInserts.length > 0) {
    const { error: exerciseError } = await supabase.from("workout_exercises").insert(exerciseInserts)
    if (exerciseError) throw exerciseError
  }

  return program
}

export async function deleteActiveWorkoutProgram(memberId: string) {
  const supabase = await getClient()
  const { error } = await supabase
    .from("workout_programs")
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq("member_id", memberId)
    .eq("is_active", true)

  if (error) throw error
}
