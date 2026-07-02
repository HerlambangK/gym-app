import { eq, asc } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { membership_plans, planTypeEnum } from "@/db/schema"
import { membershipPlans } from "@/data/gym"

type PlanType = (typeof planTypeEnum.enumValues)[number]

function hasDatabaseUrl() {
  return Boolean(process.env.SUPABASE_DB_URL || process.env.DATABASE_URL)
}

function normalizePlanType(type: string): PlanType {
  const values = planTypeEnum.enumValues as readonly string[]
  return values.includes(type) ? type as PlanType : "MONTHLY"
}

export async function getPlans() {
  if (!hasDatabaseUrl()) {
    return membershipPlans.map((plan) => ({
      id: plan.code,
      name: plan.name,
      code: plan.code,
      type: plan.type,
      duration_days: plan.durationDays,
      price: plan.price,
      description: plan.description,
      is_active: true,
      created_at: null,
      updated_at: null,
    })).sort((a, b) => a.price - b.price)
  }

  const data = await db
    .select()
    .from(membership_plans)
    .where(eq(membership_plans.is_active, true))
    .orderBy(asc(membership_plans.price))
  return data
}

export async function getAllPlans() {
  const data = await db
    .select()
    .from(membership_plans)
    .orderBy(asc(membership_plans.price))
  return data
}

export async function getPlanByCode(code: string) {
  const [data] = await db
    .select()
    .from(membership_plans)
    .where(eq(membership_plans.code, code))
    .limit(1)
  return data || null
}

export async function getPlanById(id: string) {
  const [data] = await db
    .select()
    .from(membership_plans)
    .where(eq(membership_plans.id, id))
    .limit(1)
  return data || null
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
  const now = new Date().toISOString()
  const values = {
    name: input.name,
    code: input.code,
    type: normalizePlanType(input.type),
    duration_days: input.durationDays,
    price: input.price,
    description: input.description || null,
    is_active: input.isActive,
    updated_at: now,
  }

  if (input.id) {
    const [data] = await db
      .update(membership_plans)
      .set({ ...values, id: input.id })
      .where(eq(membership_plans.id, input.id))
      .returning()
    return data
  }

  const [data] = await db
    .insert(membership_plans)
    .values(values)
    .onConflictDoUpdate({ target: membership_plans.code, set: values })
    .returning()
  return data
}

export async function setPlanActive(id: string, isActive: boolean) {
  await db
    .update(membership_plans)
    .set({ is_active: isActive, updated_at: new Date().toISOString() })
    .where(eq(membership_plans.id, id))
}
