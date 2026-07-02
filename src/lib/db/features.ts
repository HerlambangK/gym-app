import { eq, asc } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { features, plan_features } from "@/db/schema"

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
  const data = await db
    .select()
    .from(features)
    .orderBy(asc(features.category))

  return data as FeatureRow[]
}

export async function getPlanFeatures(planId: string) {
  const rows = await db
    .select({ code: features.code })
    .from(plan_features)
    .innerJoin(features, eq(plan_features.feature_id, features.id))
    .where(eq(plan_features.plan_id, planId))

  return rows.map((r) => r.code)
}

export async function toggleFeature(featureId: string, isActive: boolean) {
  await db.update(features).set({ is_active: isActive }).where(eq(features.id, featureId))
}
