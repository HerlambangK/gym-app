import { eq, asc, isNotNull } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { branches } from "@/db/schema"

export async function getBranches() {
  return await db
    .select()
    .from(branches)
    .where(eq(branches.is_active, true))
    .orderBy(asc(branches.created_at))
}

export async function getBranchById(id: string) {
  const [data] = await db.select().from(branches).where(eq(branches.id, id)).limit(1)
  return data || null
}

export async function getDefaultBranch() {
  const [data] = await db
    .select()
    .from(branches)
    .where(eq(branches.is_active, true))
    .orderBy(asc(branches.created_at))
    .limit(1)
  return data || null
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

  if (input.id) {
    const [data] = await db.update(branches).set(payload).where(eq(branches.id, input.id)).returning()
    return data
  }

  const [data] = await db.insert(branches).values(payload).returning()
  return data
}
