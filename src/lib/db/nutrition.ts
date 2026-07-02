import { eq, and, desc } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { nutrition_logs, nutrition_targets } from "@/db/schema"

export async function getNutritionLogs(memberId: string, limit = 30) {
  return await db
    .select()
    .from(nutrition_logs)
    .where(eq(nutrition_logs.member_id, memberId))
    .orderBy(desc(nutrition_logs.log_date))
    .limit(limit)
}

export async function createNutritionLog(input: {
  memberId: string
  logDate: string
  mealType?: string
  foodName?: string
  portion?: string
  eatenAt?: string
  weightKg?: number
  calories?: number
  proteinGram?: number
  carbsGram?: number
  fatGram?: number
  waterMl?: number
  notes?: string
}) {
  const [data] = await db
    .insert(nutrition_logs)
    .values({
      member_id: input.memberId,
      log_date: input.logDate,
      meal_type: input.mealType || "MEAL",
      food_name: input.foodName || null,
      portion: input.portion || null,
      eaten_at: input.eatenAt || null,
      weight_kg: input.weightKg != null ? input.weightKg : null,
      calories: input.calories || null,
      protein_gram: input.proteinGram || null,
      carbs_gram: input.carbsGram || null,
      fat_gram: input.fatGram || null,
      water_ml: input.waterMl || null,
      notes: input.notes || null,
    })
    .returning()
  return data
}

export async function updateNutritionLog(input: {
  memberId: string
  logId: string
  logDate: string
  mealType?: string
  foodName?: string
  portion?: string
  eatenAt?: string
  weightKg?: number
  calories?: number
  proteinGram?: number
  carbsGram?: number
  fatGram?: number
  waterMl?: number
  notes?: string
}) {
  const [data] = await db
    .update(nutrition_logs)
    .set({
      log_date: input.logDate,
      meal_type: input.mealType || "MEAL",
      food_name: input.foodName || null,
      portion: input.portion || null,
      eaten_at: input.eatenAt || null,
      weight_kg: input.weightKg != null ? input.weightKg : null,
      calories: input.calories || null,
      protein_gram: input.proteinGram || null,
      carbs_gram: input.carbsGram || null,
      fat_gram: input.fatGram || null,
      water_ml: input.waterMl || null,
      notes: input.notes || null,
      updated_at: new Date().toISOString(),
    })
    .where(and(eq(nutrition_logs.id, input.logId), eq(nutrition_logs.member_id, input.memberId)))
    .returning()
  return data
}

export async function deleteNutritionLog(memberId: string, logId: string) {
  await db
    .delete(nutrition_logs)
    .where(and(eq(nutrition_logs.id, logId), eq(nutrition_logs.member_id, memberId)))
}

export async function getNutritionTarget(memberId: string) {
  const [data] = await db
    .select()
    .from(nutrition_targets)
    .where(eq(nutrition_targets.member_id, memberId))
    .limit(1)
  return data || null
}

export async function upsertNutritionTarget(input: {
  memberId: string
  heightCm?: number
  age?: number
  gender?: string
  goal?: string
  activityLevel?: string
  allergies?: string
  foodPreferences?: string
  dailyFoodBudget?: number
  mealsPerDay?: number
  targetBmi?: number
  targetCalories?: number
  targetWeightKg?: number
  targetProteinGram?: number
  targetCarbsGram?: number
  targetFatGram?: number
  targetWaterMl?: number
  mealPattern?: string
  notes?: string
}) {
  const now = new Date().toISOString()
  const values: Record<string, unknown> = {
    member_id: input.memberId,
    updated_at: now,
  }
  const setIfDefined = (key: string, value: unknown) => {
    if (typeof value !== "undefined") values[key] = value === "" ? null : value
  }

  setIfDefined("height_cm", input.heightCm)
  setIfDefined("age", input.age)
  setIfDefined("gender", input.gender)
  setIfDefined("goal", input.goal)
  setIfDefined("activity_level", input.activityLevel)
  setIfDefined("allergies", input.allergies)
  setIfDefined("food_preferences", input.foodPreferences)
  setIfDefined("daily_food_budget", input.dailyFoodBudget)
  setIfDefined("meals_per_day", input.mealsPerDay)
  setIfDefined("target_bmi", input.targetBmi)
  setIfDefined("target_calories", input.targetCalories)
  setIfDefined("target_weight_kg", input.targetWeightKg)
  setIfDefined("target_protein_gram", input.targetProteinGram)
  setIfDefined("target_carbs_gram", input.targetCarbsGram)
  setIfDefined("target_fat_gram", input.targetFatGram)
  setIfDefined("target_water_ml", input.targetWaterMl)
  setIfDefined("meal_pattern", input.mealPattern)
  setIfDefined("notes", input.notes)

  const [data] = await db
    .insert(nutrition_targets)
    .values(values as typeof nutrition_targets.$inferInsert)
    .onConflictDoUpdate({
      target: nutrition_targets.member_id,
      set: Object.fromEntries(Object.entries(values).filter(([key]) => key !== "member_id")),
    })
    .returning()
  return data
}
