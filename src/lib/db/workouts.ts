import { eq, and, desc, asc } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { workout_programs, workout_sessions, workout_exercises } from "@/db/schema"

export type WorkoutExerciseInput = {
  dayName: string
  exerciseName: string
  exerciseType: string
  sets: number
  reps?: string
  loadNote?: string
}

export async function getActiveWorkoutProgram(memberId: string) {
  const [program] = await db
    .select({
      id: workout_programs.id,
      title: workout_programs.title,
      goal: workout_programs.goal,
      is_active: workout_programs.is_active,
      created_at: workout_programs.created_at,
      updated_at: workout_programs.updated_at,
    })
    .from(workout_programs)
    .where(and(eq(workout_programs.member_id, memberId), eq(workout_programs.is_active, true)))
    .orderBy(desc(workout_programs.created_at))
    .limit(1)

  if (!program) return null

  const rows = await db
    .select({
      session_id: workout_sessions.id,
      day_name: workout_sessions.day_name,
      session_order: workout_sessions.session_order,
      exercise_id: workout_exercises.id,
      exercise_name: workout_exercises.exercise_name,
      exercise_type: workout_exercises.exercise_type,
      sets: workout_exercises.sets,
      reps: workout_exercises.reps,
      load_note: workout_exercises.load_note,
      exercise_order: workout_exercises.exercise_order,
    })
    .from(workout_sessions)
    .leftJoin(workout_exercises, eq(workout_exercises.session_id, workout_sessions.id))
    .where(eq(workout_sessions.program_id, program.id))
    .orderBy(asc(workout_sessions.session_order), asc(workout_exercises.exercise_order))

  const sessions = new Map<string, {
    id: string
    day_name: string
    session_order: number
    workout_exercises: Array<{
      id: string
      exercise_name: string
      exercise_type: string
      sets: number
      reps: string | null
      load_note: string | null
      exercise_order: number
    }>
  }>()

  for (const row of rows) {
    if (!sessions.has(row.session_id)) {
      sessions.set(row.session_id, {
        id: row.session_id,
        day_name: row.day_name,
        session_order: row.session_order,
        workout_exercises: [],
      })
    }
    if (row.exercise_id) {
      sessions.get(row.session_id)?.workout_exercises.push({
        id: row.exercise_id,
        exercise_name: row.exercise_name || "",
        exercise_type: row.exercise_type || "",
        sets: row.sets || 1,
        reps: row.reps,
        load_note: row.load_note,
        exercise_order: row.exercise_order || 1,
      })
    }
  }

  return {
    id: program.id,
    title: program.title,
    goal: program.goal,
    level: null,
    weekly_sessions: sessions.size || null,
    session_duration_minutes: null,
    equipment: null,
    limitations: null,
    preference: null,
    is_active: program.is_active,
    created_at: program.created_at,
    updated_at: program.updated_at,
    workout_sessions: Array.from(sessions.values()),
  }
}

export async function replaceActiveWorkoutProgram(input: {
  memberId: string
  title: string
  goal?: string
  level?: string
  weeklySessions?: number
  sessionDurationMinutes?: number
  equipment?: string
  limitations?: string
  preference?: string
  exercises: WorkoutExerciseInput[]
}) {
  await db
    .update(workout_programs)
    .set({ is_active: false, updated_at: new Date().toISOString() })
    .where(and(eq(workout_programs.member_id, input.memberId), eq(workout_programs.is_active, true)))

  const [program] = await db
    .insert(workout_programs)
    .values({
      member_id: input.memberId,
      title: input.title,
      goal: input.goal || null,
      is_active: true,
    })
    .returning()

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

  const sessions = await db
    .insert(workout_sessions)
    .values(sessionInserts)
    .returning()

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
    await db.insert(workout_exercises).values(exerciseInserts)
  }

  return program
}

export async function deleteActiveWorkoutProgram(memberId: string) {
  await db
    .update(workout_programs)
    .set({ is_active: false, updated_at: new Date().toISOString() })
    .where(and(eq(workout_programs.member_id, memberId), eq(workout_programs.is_active, true)))
}
