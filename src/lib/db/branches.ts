import { createAdminSupabaseClient } from "@/lib/supabase-server"

export async function getBranches() {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase.from("branches").select("*").eq("is_active", true).order("created_at")
  return data || []
}

export async function getBranchById(id: string) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase.from("branches").select("*").eq("id", id).single()
  return data
}

export async function getDefaultBranch() {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase.from("branches").select("*").eq("is_active", true).order("created_at").limit(1).single()
  return data
}

export async function upsertBranchLocation(input: {
  id?: string
  name: string
  address: string
  latitude: number
  longitude: number
  radiusMeters: number
  phone?: string | null
  email?: string | null
}) {
  const supabase = await createAdminSupabaseClient()
  const payload = {
    name: input.name,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
    radius_meters: input.radiusMeters,
    phone: input.phone || null,
    email: input.email || null,
    is_active: true,
    updated_at: new Date().toISOString(),
  }

  const query = input.id
    ? supabase.from("branches").update(payload).eq("id", input.id)
    : supabase.from("branches").insert(payload)

  const { data, error } = await query.select().single()
  if (error) throw error
  return data
}
