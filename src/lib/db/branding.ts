import { createAdminSupabaseClient } from "@/lib/supabase-server"

export async function getBrandingSettings() {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase.from("branding_settings").select("*").limit(1).single()
  return data
}

export async function updateBrandingSettings(settings: Record<string, unknown>) {
  const supabase = await createAdminSupabaseClient()
  const existing = await getBrandingSettings()
  if (existing) {
    const { error } = await supabase.from("branding_settings").update(settings).eq("id", existing.id)
    if (error) throw error
  } else {
    const { error } = await supabase.from("branding_settings").insert(settings)
    if (error) throw error
  }
}
