import { createAdminSupabaseClient } from "@/lib/supabase-server"

export type WorkoutExerciseInput = {
  dayName: string
  exerciseName: string
  exerciseType: string
  sets: number
  reps?: string
  loadNote?: string
}

export async function getActiveWorkoutProgram(memberId: string) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase
    .from("workout_programs")
    .select("*, workout_sessions(*, workout_exercises(*))")
    .eq("member_id", memberId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  return data
}

export async function replaceActiveWorkoutProgram(input: {
  memberId: string
  title: string
  goal?: string
  exercises: WorkoutExerciseInput[]
}) {
  const supabase = await createAdminSupabaseClient()

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

  let sessionOrder = 1
  for (const [dayName, exercises] of Object.entries(grouped)) {
    const { data: session, error: sessionError } = await supabase
      .from("workout_sessions")
      .insert({
        program_id: program.id,
        day_name: dayName,
        session_order: sessionOrder,
      })
      .select()
      .single()

    if (sessionError) throw sessionError

    const rows = exercises.map((exercise, index) => ({
      session_id: session.id,
      exercise_name: exercise.exerciseName,
      exercise_type: exercise.exerciseType,
      sets: exercise.sets,
      reps: exercise.reps || null,
      load_note: exercise.loadNote || null,
      exercise_order: index + 1,
    }))

    const { error: exerciseError } = await supabase.from("workout_exercises").insert(rows)
    if (exerciseError) throw exerciseError
    sessionOrder += 1
  }

  return program
}
