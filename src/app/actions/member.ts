"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getMemberByUserId } from "@/lib/db/members"
import { createNutritionLog, deleteNutritionLog, upsertNutritionTarget } from "@/lib/db/nutrition"
import { deleteActiveWorkoutProgram, replaceActiveWorkoutProgram } from "@/lib/db/workouts"
import { upsertUserProfile } from "@/lib/db/users"
import { requireUser } from "@/lib/server/guards"

export type ActionState = {
  ok: boolean
  message: string
}

const nutritionSchema = z.object({
  foodName: z.string().min(2, "Nama makanan wajib diisi"),
  logDate: z.string().min(8),
  calories: z.coerce.number().int().min(0).max(20000),
  proteinGram: optionalNumber(z.number().int().min(0).max(1000)),
  carbsGram: optionalNumber(z.number().int().min(0).max(2000)),
  fatGram: optionalNumber(z.number().int().min(0).max(1000)),
  waterMl: optionalNumber(z.number().int().min(0).max(20000)),
  weightKg: optionalNumber(z.number().min(20).max(400)),
  targetBmi: optionalNumber(z.number().min(10).max(60)),
  targetCalories: optionalNumber(z.number().int().min(500).max(20000)),
  targetWeightKg: optionalNumber(z.number().min(20).max(400)),
  targetProteinGram: optionalNumber(z.number().int().min(0).max(1000)),
  notes: z.string().optional(),
})

function optionalNumber(schema: z.ZodType<number>) {
  return z.preprocess((value) => {
    if (value === "" || value === null || typeof value === "undefined") return undefined
    return Number(value)
  }, schema.optional())
}

export async function saveNutritionEntry(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser()
  const member = await getMemberByUserId(user.id)
  if (!member) return { ok: false, message: "Profil member belum lengkap." }

  const parsed = nutritionSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) {
    return { ok: false, message: "Periksa kembali input nutrisi." }
  }

  await Promise.all([
    createNutritionLog({
      memberId: member.id,
      logDate: parsed.data.logDate,
      foodName: parsed.data.foodName,
      calories: parsed.data.calories,
      proteinGram: parsed.data.proteinGram,
      carbsGram: parsed.data.carbsGram,
      fatGram: parsed.data.fatGram,
      waterMl: parsed.data.waterMl,
      weightKg: parsed.data.weightKg,
      notes: parsed.data.notes,
    }),
    upsertNutritionTarget({
      memberId: member.id,
      targetBmi: parsed.data.targetBmi,
      targetCalories: parsed.data.targetCalories,
      targetWeightKg: parsed.data.targetWeightKg,
      targetProteinGram: parsed.data.targetProteinGram,
      notes: parsed.data.notes,
    }),
  ])

  revalidatePath("/member/nutrition")
  revalidatePath("/member/dashboard")
  return { ok: true, message: "Log nutrisi dan target berhasil disimpan." }
}

export async function deleteNutritionEntry(formData: FormData) {
  const user = await requireUser()
  const member = await getMemberByUserId(user.id)
  if (!member) return

  const logId = String(formData.get("logId") || "")
  if (!logId) return

  await deleteNutritionLog(member.id, logId)
  revalidatePath("/member/nutrition")
  revalidatePath("/member/dashboard")
}

const workoutSchema = z.object({
  title: z.string().min(3),
  goal: z.string().optional(),
  dayName: z.array(z.string().min(2)),
  exerciseName: z.array(z.string().min(2)),
  exerciseType: z.array(z.string().min(2)),
  sets: z.array(z.coerce.number().int().min(1).max(20)),
  reps: z.array(z.string().optional()),
  loadNote: z.array(z.string().optional()),
})

function getArray(formData: FormData, key: string) {
  return formData.getAll(key).map((value) => String(value))
}

export async function saveWorkoutProgram(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser()
  const member = await getMemberByUserId(user.id)
  if (!member) return { ok: false, message: "Profil member belum lengkap." }

  const parsed = workoutSchema.safeParse({
    title: formData.get("title"),
    goal: formData.get("goal"),
    dayName: getArray(formData, "dayName"),
    exerciseName: getArray(formData, "exerciseName"),
    exerciseType: getArray(formData, "exerciseType"),
    sets: getArray(formData, "sets"),
    reps: getArray(formData, "reps"),
    loadNote: getArray(formData, "loadNote"),
  })

  if (!parsed.success || parsed.data.exerciseName.length === 0) {
    return { ok: false, message: "Minimal satu latihan wajib diisi." }
  }

  await replaceActiveWorkoutProgram({
    memberId: member.id,
    title: parsed.data.title,
    goal: parsed.data.goal,
    exercises: parsed.data.exerciseName.map((exerciseName, index) => ({
      dayName: parsed.data.dayName[index] || "Hari Latihan",
      exerciseName,
      exerciseType: parsed.data.exerciseType[index] || "Strength",
      sets: parsed.data.sets[index] || 3,
      reps: parsed.data.reps[index],
      loadNote: parsed.data.loadNote[index],
    })),
  })

  revalidatePath("/member/workouts")
  return { ok: true, message: "Program latihan berhasil disimpan." }
}

export async function deleteWorkoutProgram() {
  const user = await requireUser()
  const member = await getMemberByUserId(user.id)
  if (!member) return

  await deleteActiveWorkoutProgram(member.id)
  revalidatePath("/member/workouts")
  revalidatePath("/member/dashboard")
}

const profileSchema = z.object({
  name: z.string().min(2),
  phone: z.string().optional(),
})

export async function saveMemberProfile(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser()
  const parsed = profileSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return { ok: false, message: "Nama minimal 2 karakter." }
  }

  await upsertUserProfile({
    id: user.id,
    name: parsed.data.name,
    email: user.email || "",
    phone: parsed.data.phone,
  })

  revalidatePath("/member/profile")
  revalidatePath("/member/dashboard")
  return { ok: true, message: "Profile berhasil diperbarui." }
}
