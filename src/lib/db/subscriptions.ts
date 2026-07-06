import { eq, and, lt, lte, gte, desc, count, inArray } from "drizzle-orm"
import { ne } from "drizzle-orm/sql/expressions/conditions"
import { db } from "@/lib/drizzle"
import { subscriptions, membership_plans, members, users, invoices } from "@/db/schema"

export async function autoExpireSubscriptions() {
  const today = new Date().toISOString().split("T")[0]
  const expiredRows = await db
    .select({ id: subscriptions.id, invoice_id: subscriptions.invoice_id })
    .from(subscriptions)
    .where(and(eq(subscriptions.status, "ACTIVE"), lt(subscriptions.end_date, today)))

  if (expiredRows.length === 0) return

  const subIds = expiredRows.map((r) => r.id)
  const invIds = expiredRows.filter((r) => r.invoice_id).map((r) => r.invoice_id!)

  await db.update(subscriptions).set({ status: "EXPIRED" }).where(inArray(subscriptions.id, subIds))

  if (invIds.length > 0) {
    await db
      .update(invoices)
      .set({ status: "EXPIRED" })
      .where(and(inArray(invoices.id, invIds), eq(invoices.status, "PAID")))
  }
}

export async function getActiveSubscription(memberId: string) {
  await autoExpireSubscriptions()
  const today = new Date().toISOString().split("T")[0]
  const rows = await db
    .select()
    .from(subscriptions)
    .innerJoin(membership_plans, eq(subscriptions.plan_id, membership_plans.id))
    .where(
      and(
        eq(subscriptions.member_id, memberId),
        eq(subscriptions.status, "ACTIVE"),
        lte(subscriptions.start_date, today),
        gte(subscriptions.end_date, today),
      ),
    )
    .orderBy(desc(subscriptions.start_date))
    .limit(1)

  if (rows.length === 0) return null
  const row = rows[0]
  return { ...row.subscriptions, membership_plans: row.membership_plans }
}

export async function createSubscription(input: {
  memberId: string
  planId: string
  invoiceId: string
  startDate: string
  endDate: string
}) {
  const [data] = await db
    .insert(subscriptions)
    .values({
      member_id: input.memberId,
      plan_id: input.planId,
      invoice_id: input.invoiceId,
      start_date: input.startDate,
      end_date: input.endDate,
      status: "PENDING_PAYMENT",
    })
    .returning()
  return data
}

export async function activateSubscription(id: string) {
  const [subData] = await db
    .select()
    .from(subscriptions)
    .innerJoin(membership_plans, eq(subscriptions.plan_id, membership_plans.id))
    .where(eq(subscriptions.id, id))
    .limit(1)

  if (!subData) throw new Error("Subscription not found")
  const { subscriptions: sub, membership_plans: plan } = subData
  const today = new Date().toISOString().split("T")[0]

  const [latestActive] = await db
    .select({ end_date: subscriptions.end_date })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.member_id, sub.member_id),
        eq(subscriptions.status, "ACTIVE"),
        gte(subscriptions.end_date, today),
        ne(subscriptions.id, id),
      ),
    )
    .orderBy(desc(subscriptions.end_date))
    .limit(1)

  const startDate = latestActive?.end_date || today
  const endDate = addDaysFromDateString(startDate, Number(plan.duration_days || 30))
  const memberType = plan.code === "DAILY_PASS" || plan.type === "DAILY" ? "DAILY" : "PREMIUM"

  await db
    .update(subscriptions)
    .set({ status: "ACTIVE", start_date: startDate, end_date: endDate })
    .where(eq(subscriptions.id, id))

  await db
    .update(members)
    .set({ status: "ACTIVE", member_type: memberType as any })
    .where(eq(members.id, sub.member_id))

  return sub
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return next.toISOString().split("T")[0]
}

function addDaysFromDateString(date: string, days: number) {
  return addDays(new Date(`${date}T00:00:00`), days)
}

export async function activateSubscriptionForInvoice(invoiceId: string) {
  const [existing] = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.invoice_id, invoiceId))
    .orderBy(desc(subscriptions.created_at))
    .limit(1)

  if (existing) return activateSubscription(existing.id)

  const [invoiceData] = await db
    .select()
    .from(invoices)
    .innerJoin(membership_plans, eq(invoices.plan_id, membership_plans.id))
    .where(eq(invoices.id, invoiceId))
    .limit(1)

  if (!invoiceData) return null
  const { invoices: inv, membership_plans: plan } = invoiceData
  const startDate = new Date().toISOString().split("T")[0]
  const durationDays = Number(plan.duration_days || 30)

  const [created] = await db
    .insert(subscriptions)
    .values({
      member_id: inv.member_id,
      plan_id: inv.plan_id,
      invoice_id: invoiceId,
      start_date: startDate,
      end_date: addDays(new Date(), durationDays),
      status: "ACTIVE",
    })
    .returning({ id: subscriptions.id })

  if (!created) throw new Error("Failed to create subscription")
  return activateSubscription(created.id)
}

export async function updateSubscriptionStatusForInvoice(invoiceId: string, status: "PENDING_PAYMENT" | "EXPIRED" | "CANCELLED") {
  await db
    .update(subscriptions)
    .set({ status })
    .where(and(eq(subscriptions.invoice_id, invoiceId), ne(subscriptions.status, "ACTIVE")))
}

export async function getMemberSubscriptions(memberId: string) {
  const rows = await db
    .select()
    .from(subscriptions)
    .innerJoin(membership_plans, eq(subscriptions.plan_id, membership_plans.id))
    .where(eq(subscriptions.member_id, memberId))
    .orderBy(desc(subscriptions.created_at))

  return rows.map((row) => ({
    ...row.subscriptions,
    membership_plans: { name: row.membership_plans.name, code: row.membership_plans.code },
  }))
}

export async function getActiveSubscriptionCount() {
  const [result] = await db
    .select({ value: count() })
    .from(subscriptions)
    .where(eq(subscriptions.status, "ACTIVE"))
  return result?.value ?? 0
}

export async function getExpiringSubscriptions(days = 7) {
  const today = new Date()
  const future = new Date(today.getTime() + days * 86400000).toISOString().split("T")[0]

  const rows = await db
    .select()
    .from(subscriptions)
    .innerJoin(members, eq(subscriptions.member_id, members.id))
    .innerJoin(users, eq(members.user_id, users.id))
    .innerJoin(membership_plans, eq(subscriptions.plan_id, membership_plans.id))
    .where(and(eq(subscriptions.status, "ACTIVE"), lte(subscriptions.end_date, future)))
    .orderBy(subscriptions.end_date)

  return rows.map((row) => ({
    ...row.subscriptions,
    members: row.members ? { users: { name: row.users?.name } } : null,
    membership_plans: { name: row.membership_plans.name },
  }))
}

export function getSubscriptionExpiryInfo(subscription: { end_date: string } | null) {
  if (!subscription) return { remainingDays: 0, isExpiringSoon: false, isCritical: false, expired: true }
  const now = new Date()
  const end = new Date(subscription.end_date + "T23:59:59")
  const remainingMs = end.getTime() - now.getTime()
  const remainingDays = Math.max(0, Math.ceil(remainingMs / 86400000))
  const expired = remainingDays <= 0
  return {
    remainingDays,
    isExpiringSoon: remainingDays > 0 && remainingDays <= 7,
    isCritical: remainingDays > 0 && remainingDays <= 3,
    expired,
  }
}

export async function getCurrentAndUpcomingSubscriptions(memberId: string) {
  await autoExpireSubscriptions()
  const today = new Date().toISOString().split("T")[0]

  const rows = await db
    .select()
    .from(subscriptions)
    .innerJoin(membership_plans, eq(subscriptions.plan_id, membership_plans.id))
    .where(and(eq(subscriptions.member_id, memberId), eq(subscriptions.status, "ACTIVE")))
    .orderBy(subscriptions.start_date)

  const mapped = rows.map((row) => ({
    ...row.subscriptions,
    membership_plans: {
      name: row.membership_plans.name,
      code: row.membership_plans.code,
      duration_days: row.membership_plans.duration_days,
    },
  }))

  const current = mapped.find((s) => s.start_date <= today && s.end_date >= today) || null
  const upcoming = mapped.filter((s) => s.start_date > today)
  return { current, upcoming }
}

export function getSubscriptionStackPreview(
  activeSubscription: { end_date: string } | null,
  planDurationDays: number,
) {
  const today = new Date().toISOString().split("T")[0]
  const startDate = activeSubscription?.end_date || today
  const endDate = addDaysFromDateString(startDate, planDurationDays)
  return { startDate, endDate }
}
