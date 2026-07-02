"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { getMemberByUserId } from "@/lib/db/members"
import { createNutritionLog, deleteNutritionLog, updateNutritionLog, upsertNutritionTarget } from "@/lib/db/nutrition"
import { deleteActiveWorkoutProgram, replaceActiveWorkoutProgram } from "@/lib/db/workouts"
import { upsertUserProfile } from "@/lib/db/users"
import { buildWorkoutNotes } from "@/lib/member-fitness-profile"
import { requireUser } from "@/lib/server/guards"

export type ActionState = {
  ok: boolean
  message: string
}

const nutritionSchema = z.object({
  logId: z.string().optional(),
  foodName: z.string().min(2, "Nama makanan wajib diisi"),
  logDate: z.string().min(8),
  mealType: z.string().min(2).optional(),
  portion: z.string().optional(),
  eatenAt: z.string().optional(),
  calories: z.coerce.number().int().min(0).max(20000),
  proteinGram: optionalNumber(z.number().int().min(0).max(1000)),
  carbsGram: optionalNumber(z.number().int().min(0).max(2000)),
  fatGram: optionalNumber(z.number().int().min(0).max(1000)),
  waterMl: optionalNumber(z.number().int().min(0).max(20000)),
  weightKg: optionalNumber(z.number().min(20).max(400)),
  heightCm: optionalNumber(z.number().min(80, "Tinggi badan minimal 80 cm.").max(260, "Tinggi badan maksimal 260 cm.")),
  age: optionalNumber(z.number().int().min(8, "Umur minimal 8 tahun.").max(100, "Umur maksimal 100 tahun.")),
  gender: z.string().optional(),
  nutritionGoal: z.string().optional(),
  activityLevel: z.string().optional(),
  allergies: z.string().optional(),
  foodPreferences: z.string().optional(),
  dailyFoodBudget: optionalNumber(z.number().int().min(0).max(10000000)),
  mealsPerDay: optionalNumber(z.number().int().min(1).max(10)),
  targetBmi: optionalNumber(z.number().min(10).max(60)),
  targetCalories: optionalNumber(z.number().int().min(500).max(20000)),
  targetWeightKg: optionalNumber(z.number().min(20).max(400)),
  targetProteinGram: optionalNumber(z.number().int().min(0).max(1000)),
  targetCarbsGram: optionalNumber(z.number().int().min(0).max(2000)),
  targetFatGram: optionalNumber(z.number().int().min(0).max(1000)),
  targetWaterMl: optionalNumber(z.number().int().min(0).max(20000)),
  mealPattern: z.string().optional(),
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
    return { ok: false, message: parsed.error.issues[0]?.message || "Periksa kembali input nutrisi." }
  }

  const targetSave = upsertNutritionTarget({
      memberId: member.id,
      heightCm: parsed.data.heightCm,
      age: parsed.data.age,
      gender: parsed.data.gender,
      goal: parsed.data.nutritionGoal,
      activityLevel: parsed.data.activityLevel,
      allergies: parsed.data.allergies,
      foodPreferences: parsed.data.foodPreferences,
      dailyFoodBudget: parsed.data.dailyFoodBudget,
      mealsPerDay: parsed.data.mealsPerDay,
      targetBmi: parsed.data.targetBmi,
      targetCalories: parsed.data.targetCalories,
      targetWeightKg: parsed.data.targetWeightKg,
      targetProteinGram: parsed.data.targetProteinGram,
      targetCarbsGram: parsed.data.targetCarbsGram,
      targetFatGram: parsed.data.targetFatGram,
      targetWaterMl: parsed.data.targetWaterMl,
      mealPattern: parsed.data.mealPattern,
      notes: parsed.data.notes,
    })

  if (parsed.data.mealType === "PROFILE") {
    await targetSave
  } else {
    const logSave = parsed.data.logId
      ? updateNutritionLog({
          memberId: member.id,
          logId: parsed.data.logId,
          logDate: parsed.data.logDate,
          mealType: parsed.data.mealType,
          foodName: parsed.data.foodName,
          portion: parsed.data.portion,
          eatenAt: parsed.data.eatenAt,
          calories: parsed.data.calories,
          proteinGram: parsed.data.proteinGram,
          carbsGram: parsed.data.carbsGram,
          fatGram: parsed.data.fatGram,
          waterMl: parsed.data.waterMl,
          weightKg: parsed.data.weightKg,
          notes: parsed.data.notes,
        })
      : createNutritionLog({
          memberId: member.id,
          logDate: parsed.data.logDate,
          mealType: parsed.data.mealType,
          foodName: parsed.data.foodName,
          portion: parsed.data.portion,
          eatenAt: parsed.data.eatenAt,
          calories: parsed.data.calories,
          proteinGram: parsed.data.proteinGram,
          carbsGram: parsed.data.carbsGram,
          fatGram: parsed.data.fatGram,
          waterMl: parsed.data.waterMl,
          weightKg: parsed.data.weightKg,
          notes: parsed.data.notes,
        })

    await Promise.all([
      logSave,
      targetSave,
    ])
  }

  revalidatePath("/member/nutrition")
  revalidatePath("/member/dashboard")
  return { ok: true, message: parsed.data.logId ? "Log nutrisi berhasil diperbarui." : "Log nutrisi berhasil ditambahkan." }
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
  level: z.string().optional(),
  weeklySessions: optionalNumber(z.number().int().min(1).max(14)),
  sessionDurationMinutes: optionalNumber(z.number().int().min(10).max(240)),
  equipment: z.string().optional(),
  limitations: z.string().optional(),
  preference: z.string().optional(),
  dayName: z.array(z.string().min(2)),
  focus: z.array(z.string().optional()),
  exerciseName: z.array(z.string().min(2)),
  exerciseType: z.array(z.string().min(2)),
  muscleGroup: z.array(z.string().optional()),
  equipmentRow: z.array(z.string().optional()),
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
    level: formData.get("level"),
    weeklySessions: formData.get("weeklySessions"),
    sessionDurationMinutes: formData.get("sessionDurationMinutes"),
    equipment: formData.get("equipment"),
    limitations: formData.get("limitations"),
    preference: formData.get("preference"),
    dayName: getArray(formData, "dayName"),
    focus: getArray(formData, "focus"),
    exerciseName: getArray(formData, "exerciseName"),
    exerciseType: getArray(formData, "exerciseType"),
    muscleGroup: getArray(formData, "muscleGroup"),
    equipmentRow: getArray(formData, "equipmentRow"),
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
    level: parsed.data.level,
    weeklySessions: parsed.data.weeklySessions,
    sessionDurationMinutes: parsed.data.sessionDurationMinutes,
    equipment: parsed.data.equipment,
    limitations: parsed.data.limitations,
    preference: parsed.data.preference,
    exercises: parsed.data.exerciseName.map((exerciseName, index) => ({
      dayName: parsed.data.dayName[index] || "Hari Latihan",
      exerciseName,
      exerciseType: parsed.data.exerciseType[index] || "Strength",
      sets: parsed.data.sets[index] || 3,
      reps: parsed.data.reps[index],
      loadNote: serializeWorkoutNote({
        focus: parsed.data.focus[index],
        muscle: parsed.data.muscleGroup[index],
        equipment: parsed.data.equipmentRow[index],
        note: parsed.data.loadNote[index],
      }),
    })),
  })

  revalidatePath("/member/workouts")
  return { ok: true, message: "Program latihan berhasil disimpan." }
}

function serializeWorkoutNote(input: { focus?: string; muscle?: string; equipment?: string; note?: string }) {
  return [
    input.focus ? `focus:${input.focus}` : "",
    input.muscle ? `muscle:${input.muscle}` : "",
    input.equipment ? `equipment:${input.equipment}` : "",
    input.note ? `note:${input.note}` : "",
  ].filter(Boolean).join("|")
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
  name: z.string().min(2, "Nama minimal 2 karakter."),
  phone: z.string().optional(),
  weightKg: optionalNumber(z.number().min(20, "Berat badan minimal 20 kg.").max(400, "Berat badan maksimal 400 kg.")),
  heightCm: optionalNumber(z.number().min(80, "Tinggi badan minimal 80 cm.").max(260, "Tinggi badan maksimal 260 cm.")),
  age: optionalNumber(z.number().int().min(8, "Umur minimal 8 tahun.").max(100, "Umur maksimal 100 tahun.")),
  gender: z.string().optional(),
  nutritionGoal: z.string().optional(),
  activityLevel: z.string().optional(),
  targetCalories: optionalNumber(z.number().int().min(500).max(20000)),
  targetProteinGram: optionalNumber(z.number().int().min(0).max(1000)),
  targetCarbsGram: optionalNumber(z.number().int().min(0).max(2000)),
  targetFatGram: optionalNumber(z.number().int().min(0).max(1000)),
  targetWaterMl: optionalNumber(z.number().int().min(0).max(20000)),
  mealsPerDay: optionalNumber(z.number().int().min(1).max(10)),
  workoutGoal: z.string().optional(),
  workoutLevel: z.string().optional(),
  workoutDays: optionalNumber(z.number().int().min(1).max(14)),
  workoutDuration: optionalNumber(z.number().int().min(10).max(240)),
  workoutEquipment: z.string().optional(),
  workoutLimitations: z.string().optional(),
})

export async function saveMemberProfile(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireUser()
  const member = await getMemberByUserId(user.id)
  const parsed = profileSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message || "Data tidak valid." }
  }

  await upsertUserProfile({
    id: user.id,
    name: parsed.data.name,
    email: user.email || "",
    phone: parsed.data.phone,
  })

  if (member) {
    await upsertNutritionTarget({
      memberId: member.id,
      heightCm: parsed.data.heightCm,
      age: parsed.data.age,
      gender: parsed.data.gender,
      goal: parsed.data.nutritionGoal,
      activityLevel: parsed.data.activityLevel,
      mealsPerDay: parsed.data.mealsPerDay,
      targetCalories: parsed.data.targetCalories,
      targetProteinGram: parsed.data.targetProteinGram,
      targetCarbsGram: parsed.data.targetCarbsGram,
      targetFatGram: parsed.data.targetFatGram,
      targetWaterMl: parsed.data.targetWaterMl,
      targetWeightKg: parsed.data.weightKg,
      notes: buildWorkoutNotes({
        goal: parsed.data.workoutGoal,
        level: parsed.data.workoutLevel,
        days: parsed.data.workoutDays,
        duration: parsed.data.workoutDuration,
        equipment: parsed.data.workoutEquipment,
        limitations: parsed.data.workoutLimitations,
      }),
    })
  }

  revalidatePath("/member/profile")
  revalidatePath("/member/dashboard")
  revalidatePath("/member/nutrition")
  revalidatePath("/member/workouts")
  return { ok: true, message: "Profile berhasil diperbarui." }
}
