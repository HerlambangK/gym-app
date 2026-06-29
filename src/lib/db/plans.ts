import { createAdminSupabaseClient } from "@/lib/supabase-server"

export async function getPlans() {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase.from("membership_plans").select("*").eq("is_active", true).order("price")
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
