import { eq } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { branding_settings } from "@/db/schema"

export async function getBrandingSettings() {
  const [data] = await db.select().from(branding_settings).limit(1)
  return data || null
}

export async function updateBrandingSettings(settings: Record<string, unknown>) {
  const existing = await getBrandingSettings()
  const now = new Date().toISOString()

  if (existing) {
    await db
      .update(branding_settings)
      .set({ ...settings, updated_at: now })
      .where(eq(branding_settings.id, existing.id))
  } else {
    await db
      .insert(branding_settings)
      .values(settings as any)
  }
}
