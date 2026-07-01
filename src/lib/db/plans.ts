import { createAdminSupabaseClient } from "@/lib/supabase-server"

export async function getPlans() {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase.from("membership_plans").select("*").eq("is_active", true).order("price")
  return data || []
}

export async function getAllPlans() {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase.from("membership_plans").select("*").order("price")
  return data || []
}

export async function getPlanByCode(code: string) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase.from("membership_plans").select("*").eq("code", code).single()
  return data
}

export async function getPlanById(id: string) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase.from("membership_plans").select("*").eq("id", id).single()
  return data
}

export async function upsertPlan(input: {
  id?: string
  name: string
  code: string
  type: string
  durationDays: number
  price: number
  description?: string
  isActive: boolean
}) {
  const supabase = await createAdminSupabaseClient()
  const payload = {
    ...(input.id ? { id: input.id } : {}),
    name: input.name,
    code: input.code,
    type: input.type,
    duration_days: input.durationDays,
    price: input.price,
    description: input.description || null,
    is_active: input.isActive,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("membership_plans")
    .upsert(payload, { onConflict: input.id ? "id" : "code" })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function setPlanActive(id: string, isActive: boolean) {
  const supabase = await createAdminSupabaseClient()
  const { error } = await supabase
    .from("membership_plans")
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id)

  if (error) throw error
}
