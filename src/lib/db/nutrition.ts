import { createAdminSupabaseClient } from "@/lib/supabase-server"

export async function getNutritionLogs(memberId: string, limit = 30) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase
    .from("nutrition_logs")
    .select("*")
    .eq("member_id", memberId)
    .order("log_date", { ascending: false })
    .limit(limit)
  return data || []
}

export async function createNutritionLog(input: {
  memberId: string
  logDate: string
  weightKg?: number
  calories?: number
  proteinGram?: number
  carbsGram?: number
  fatGram?: number
  waterMl?: number
  notes?: string
}) {
  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from("nutrition_logs")
    .upsert({
      member_id: input.memberId,
      log_date: input.logDate,
      weight_kg: input.weightKg || null,
      calories: input.calories || null,
      protein_gram: input.proteinGram || null,
      carbs_gram: input.carbsGram || null,
      fat_gram: input.fatGram || null,
      water_ml: input.waterMl || null,
      notes: input.notes || null,
    })
    .select()
    .single()
  if (error) throw error
  return data
}
