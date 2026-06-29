import { createAdminSupabaseClient } from "@/lib/supabase-server"

export async function getBranches() {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase.from("branches").select("*").eq("is_active", true)
  return data || []
}

export async function getBranchById(id: string) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase.from("branches").select("*").eq("id", id).single()
  return data
}

export async function getDefaultBranch() {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase.from("branches").select("*").eq("is_active", true).limit(1).single()
  return data
}
