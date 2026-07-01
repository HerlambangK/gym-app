import { createAdminSupabaseClient } from "@/lib/supabase-server"

export type FeatureRow = {
  id: string
  code: string
  name: string
  description: string | null
  category: string | null
  is_premium: boolean
  is_active: boolean
}

export async function getFeatures() {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase
    .from("features")
    .select("id, code, name, description, category, is_premium, is_active")
    .order("category")

  return (data || []) as FeatureRow[]
}

export async function getPlanFeatures(planId: string) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase
    .from("plan_features")
    .select("features(code)")
    .eq("plan_id", planId)
    .eq("is_enabled", true)

  return (data as unknown as Array<{ features: { code: string } }>)?.map((pf) => pf.features.code) || []
}

export async function toggleFeature(featureId: string, isActive: boolean) {
  const supabase = await createAdminSupabaseClient()
  const { error } = await supabase.from("features").update({ is_active: isActive }).eq("id", featureId)
  if (error) throw error
}
