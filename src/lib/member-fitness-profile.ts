export const defaultNutritionTargets = {
  calories: 2200,
  proteinGram: 140,
  carbsGram: 250,
  fatGram: 70,
  waterMl: 2500,
  mealsPerDay: 3,
}

export const defaultWorkoutProfile = {
  goal: "muscle_gain",
  level: "beginner",
  days: "3",
  duration: "45",
  equipment: "",
  limitations: "",
}

export type NutritionTargetLike = {
  gender?: string | null
  height_cm?: number | null
  age?: number | null
  target_calories?: number | null
  target_protein_gram?: number | null
  target_carbs_gram?: number | null
  target_fat_gram?: number | null
  target_water_ml?: number | null
  meals_per_day?: number | null
  notes?: string | null
} | null

export function getNutritionDefaults(target: NutritionTargetLike) {
  return {
    calories: Number(target?.target_calories || defaultNutritionTargets.calories),
    proteinGram: Number(target?.target_protein_gram || defaultNutritionTargets.proteinGram),
    carbsGram: Number(target?.target_carbs_gram || defaultNutritionTargets.carbsGram),
    fatGram: Number(target?.target_fat_gram || defaultNutritionTargets.fatGram),
    waterMl: Number(target?.target_water_ml || defaultNutritionTargets.waterMl),
    mealsPerDay: Number(target?.meals_per_day || defaultNutritionTargets.mealsPerDay),
  }
}

export function parseWorkoutNotes(notes?: string | null) {
  const values = Object.fromEntries(
    (notes || "").split("|").map((item) => {
      const [key, ...value] = item.split(":")
      return [key, value.join(":")]
    }),
  )
  return {
    goal: values.workout_goal || defaultWorkoutProfile.goal,
    level: values.workout_level || defaultWorkoutProfile.level,
    days: values.workout_days || defaultWorkoutProfile.days,
    duration: values.workout_duration || defaultWorkoutProfile.duration,
    equipment: values.workout_equipment || defaultWorkoutProfile.equipment,
    limitations: values.workout_limitations || defaultWorkoutProfile.limitations,
  }
}

export function buildWorkoutNotes(input: {
  goal?: string
  level?: string
  days?: number
  duration?: number
  equipment?: string
  limitations?: string
}) {
  return [
    input.goal ? `workout_goal:${input.goal}` : "",
    input.level ? `workout_level:${input.level}` : "",
    input.days ? `workout_days:${input.days}` : "",
    input.duration ? `workout_duration:${input.duration}` : "",
    input.equipment ? `workout_equipment:${input.equipment}` : "",
    input.limitations ? `workout_limitations:${input.limitations}` : "",
  ].filter(Boolean).join("|")
}

export function isFitnessProfileIncomplete(target: NutritionTargetLike) {
  return !target?.height_cm || !target?.age || !target?.target_calories || !target?.target_protein_gram
}
