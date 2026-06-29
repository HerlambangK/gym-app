import { createAdminSupabaseClient } from "@/lib/supabase-server"

export async function getFeatures() {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase.from("features").select("*").order("category")
  return data || []
}

export async function getPlanFeatures(planId: string) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase
    .from("plan_features")
    .select("features(code, name)")
    .eq("plan_id", planId)
    .eq("is_enabled", true)
  return (data as unknown as Array<{ features: { code: string; name: string } }>)?.map((pf) => pf.features.code) || []
}

export async function toggleFeature(featureId: string, isActive: boolean) {
  const supabase = await createAdminSupabaseClient()
  const { error } = await supabase.from("features").update({ is_active: isActive }).eq("id", featureId)
  if (error) throw error
}
