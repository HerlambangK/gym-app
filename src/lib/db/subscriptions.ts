import { eq, and, lt, lte, gte, desc, count, inArray } from "drizzle-orm"
import { ne } from "drizzle-orm/sql/expressions/conditions"
import { db } from "@/lib/drizzle"
import { subscriptions, membership_plans, members, users, invoices } from "@/db/schema"

type MemberInsert = typeof members.$inferInsert
type MemberType = NonNullable<MemberInsert["member_type"]>

function getTodayDateString() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date())
}

function toJakartaDateString(value: string | Date) {
  if (value instanceof Date) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Jakarta",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(value)
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) return toJakartaDateString(parsed)
  return value.slice(0, 10)
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setUTCDate(next.getUTCDate() + days)
  return next.toISOString().split("T")[0]
}

function addDaysFromDateString(date: string, days: number) {
  return addDays(new Date(`${date}T00:00:00Z`), days)
}

function getPlanMemberType(plan: { code?: string | null; type?: string | null }) {
  return plan.code === "DAILY_PASS" ? "DAILY" : "PREMIUM"
}

function getInclusiveEndDate(startDate: string, durationDays: number) {
  return addDaysFromDateString(startDate, Math.max(0, durationDays - 1))
}

async function getNextSubscriptionWindow(memberId: string, durationDays: number, excludeSubscriptionId?: string) {
  const today = getTodayDateString()
  const conditions = [
    eq(subscriptions.member_id, memberId),
    eq(subscriptions.status, "ACTIVE"),
    gte(subscriptions.end_date, today),
  ]
  if (excludeSubscriptionId) conditions.push(ne(subscriptions.id, excludeSubscriptionId))

  const [latestActive] = await db
    .select({ end_date: subscriptions.end_date })
    .from(subscriptions)
    .where(and(...conditions))
    .orderBy(desc(subscriptions.end_date))
    .limit(1)

  const startDate = latestActive?.end_date
    ? addDaysFromDateString(toJakartaDateString(latestActive.end_date), 1)
    : today
  const endDate = getInclusiveEndDate(startDate, durationDays)

  return { startDate, endDate }
}

export async function getNextSubscriptionPreview(memberId: string, durationDays: number) {
  return getNextSubscriptionWindow(memberId, Math.max(1, durationDays))
}

export async function syncMemberSubscriptionType(memberId: string) {
  const today = getTodayDateString()
  const rows = await db
    .select({
      code: membership_plans.code,
      type: membership_plans.type,
    })
    .from(subscriptions)
    .innerJoin(membership_plans, eq(subscriptions.plan_id, membership_plans.id))
    .where(and(
      eq(subscriptions.member_id, memberId),
      eq(subscriptions.status, "ACTIVE"),
      lte(subscriptions.start_date, today),
      gte(subscriptions.end_date, today),
    ))

  const hasPremium = rows.some((plan) => getPlanMemberType(plan) === "PREMIUM")
  const hasDaily = rows.some((plan) => getPlanMemberType(plan) === "DAILY")
  const memberType: MemberType = hasPremium ? "PREMIUM" : hasDaily ? "DAILY" : "TRIAL"

  await db
    .update(members)
    .set({ member_type: memberType, updated_at: new Date().toISOString() })
    .where(eq(members.id, memberId))

  return memberType
}

export async function autoExpireSubscriptions() {
  const today = getTodayDateString()
  const now = new Date().toISOString()

  const expiredRows = await db
    .select({ id: subscriptions.id, member_id: subscriptions.member_id })
    .from(subscriptions)
    .where(and(eq(subscriptions.status, "ACTIVE"), lt(subscriptions.end_date, today)))

  if (expiredRows.length > 0) {
    const subIds = expiredRows.map((r) => r.id)
    const memberIds = Array.from(new Set(expiredRows.map((r) => r.member_id)))

    await db
      .update(subscriptions)
      .set({ status: "EXPIRED", updated_at: now })
      .where(inArray(subscriptions.id, subIds))

    for (const memberId of memberIds) {
      await syncMemberSubscriptionType(memberId)
    }
  }

  const stalePendingRows = await db
    .select({ id: subscriptions.id, member_id: subscriptions.member_id })
    .from(subscriptions)
    .innerJoin(invoices, eq(subscriptions.invoice_id, invoices.id))
    .where(and(
      eq(subscriptions.status, "PENDING_PAYMENT"),
      eq(invoices.status, "EXPIRED"),
    ))

  if (stalePendingRows.length > 0) {
    await db
      .update(subscriptions)
      .set({ status: "EXPIRED", updated_at: now })
      .where(inArray(subscriptions.id, stalePendingRows.map((row) => row.id)))

    for (const memberId of Array.from(new Set(stalePendingRows.map((row) => row.member_id)))) {
      await syncMemberSubscriptionType(memberId)
    }
  }
}

export async function getActiveSubscription(memberId: string) {
  await autoExpireSubscriptions()
  const today = getTodayDateString()
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
  const durationDays = Math.max(1, Number(plan.duration_days || 30))
  const { startDate, endDate } = await getNextSubscriptionWindow(sub.member_id, durationDays, id)
  const memberType = getPlanMemberType(plan)

  await db
    .update(subscriptions)
    .set({ status: "ACTIVE", start_date: startDate, end_date: endDate, updated_at: new Date().toISOString() })
    .where(eq(subscriptions.id, id))

  await db
    .update(members)
    .set({ status: "ACTIVE", member_type: memberType, updated_at: new Date().toISOString() })
    .where(eq(members.id, sub.member_id))

  return { ...sub, status: "ACTIVE" as const, start_date: startDate, end_date: endDate, membership_plans: plan }
}

export async function activateSubscriptionForInvoice(invoiceId: string) {
  const [existing] = await db
    .select({
      id: subscriptions.id,
      status: subscriptions.status,
      start_date: subscriptions.start_date,
      end_date: subscriptions.end_date,
      member_id: subscriptions.member_id,
      code: membership_plans.code,
      type: membership_plans.type,
    })
    .from(subscriptions)
    .innerJoin(membership_plans, eq(subscriptions.plan_id, membership_plans.id))
    .where(eq(subscriptions.invoice_id, invoiceId))
    .orderBy(desc(subscriptions.created_at))
    .limit(1)

  if (existing?.status === "ACTIVE") {
    await syncMemberSubscriptionType(existing.member_id)
    return existing
  }

  if (existing?.status === "EXPIRED" && toJakartaDateString(existing.end_date) < getTodayDateString()) {
    await syncMemberSubscriptionType(existing.member_id)
    return existing
  }

  if (existing) return activateSubscription(existing.id)

  const [invoiceData] = await db
    .select()
    .from(invoices)
    .innerJoin(membership_plans, eq(invoices.plan_id, membership_plans.id))
    .where(eq(invoices.id, invoiceId))
    .limit(1)

  if (!invoiceData) return null
  const { invoices: inv, membership_plans: plan } = invoiceData
  const durationDays = Math.max(1, Number(plan.duration_days || 30))
  const { startDate, endDate } = await getNextSubscriptionWindow(inv.member_id, durationDays)

  const [created] = await db
    .insert(subscriptions)
    .values({
      member_id: inv.member_id,
      plan_id: inv.plan_id,
      invoice_id: invoiceId,
      start_date: startDate,
      end_date: endDate,
      status: "ACTIVE",
    })
    .returning({ id: subscriptions.id })

  if (!created) throw new Error("Failed to create subscription")
  return activateSubscription(created.id)
}

export async function getSubscriptionForInvoice(invoiceId: string) {
  const [row] = await db
    .select()
    .from(subscriptions)
    .innerJoin(membership_plans, eq(subscriptions.plan_id, membership_plans.id))
    .where(eq(subscriptions.invoice_id, invoiceId))
    .orderBy(desc(subscriptions.created_at))
    .limit(1)

  if (!row) return null
  return { ...row.subscriptions, membership_plans: row.membership_plans }
}

export async function updateSubscriptionStatusForInvoice(invoiceId: string, status: "PENDING_PAYMENT" | "EXPIRED" | "CANCELLED") {
  const rows = await db
    .select({ member_id: subscriptions.member_id })
    .from(subscriptions)
    .where(eq(subscriptions.invoice_id, invoiceId))

  await db
    .update(subscriptions)
    .set({ status, updated_at: new Date().toISOString() })
    .where(and(eq(subscriptions.invoice_id, invoiceId), ne(subscriptions.status, "ACTIVE")))

  for (const memberId of Array.from(new Set(rows.map((row) => row.member_id)))) {
    await syncMemberSubscriptionType(memberId)
  }
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

export async function getPaidSubscriptionHistory(memberId: string) {
  const rows = await db
    .select()
    .from(subscriptions)
    .innerJoin(membership_plans, eq(subscriptions.plan_id, membership_plans.id))
    .innerJoin(invoices, eq(subscriptions.invoice_id, invoices.id))
    .where(and(eq(invoices.member_id, memberId), eq(invoices.status, "PAID")))
    .orderBy(desc(subscriptions.created_at))

  return rows.map((row) => ({
    ...row.subscriptions,
    membership_plans: row.membership_plans,
    invoice: { status: row.invoices.status, expired_at: row.invoices.expired_at },
  }))
}

export async function getActiveSubscriptionCount() {
  await autoExpireSubscriptions()
  const today = getTodayDateString()
  const [result] = await db
    .select({ value: count() })
    .from(subscriptions)
    .where(and(
      eq(subscriptions.status, "ACTIVE"),
      lte(subscriptions.start_date, today),
      gte(subscriptions.end_date, today),
    ))
  return result?.value ?? 0
}

export async function getExpiringSubscriptions(days = 7) {
  const today = getTodayDateString()
  const future = addDaysFromDateString(today, days)

  const rows = await db
    .select()
    .from(subscriptions)
    .innerJoin(members, eq(subscriptions.member_id, members.id))
    .innerJoin(users, eq(members.user_id, users.id))
    .innerJoin(membership_plans, eq(subscriptions.plan_id, membership_plans.id))
    .where(and(
      eq(subscriptions.status, "ACTIVE"),
      lte(subscriptions.start_date, today),
      lte(subscriptions.end_date, future),
      gte(subscriptions.end_date, today),
    ))
    .orderBy(subscriptions.end_date)

  return rows.map((row) => ({
    ...row.subscriptions,
    members: row.members ? { users: { name: row.users?.name } } : null,
    membership_plans: { name: row.membership_plans.name },
  }))
}

export function getSubscriptionExpiryInfo(subscription: { end_date: string } | null) {
  if (!subscription) return { remainingDays: 0, isExpiringSoon: false, isCritical: false, expired: true }
  const today = getTodayDateString()
  const endDate = toJakartaDateString(subscription.end_date)
  const remainingDays = endDate < today
    ? 0
    : daysBetweenDateStrings(today, endDate) + 1
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
  const today = getTodayDateString()

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

  const current = mapped.find((s) => toJakartaDateString(s.start_date) <= today && toJakartaDateString(s.end_date) >= today) || null
  const upcoming = mapped.filter((s) => toJakartaDateString(s.start_date) > today)
  return { current, upcoming }
}

export function getSubscriptionStackPreview(
  activeSubscription: { end_date: string } | null,
  planDurationDays: number,
) {
  const today = getTodayDateString()
  const startDate = activeSubscription?.end_date
    ? addDaysFromDateString(toJakartaDateString(activeSubscription.end_date), 1)
    : today
  const endDate = getInclusiveEndDate(startDate, Math.max(1, planDurationDays))
  return { startDate, endDate }
}

function daysBetweenDateStrings(startDate: string, endDate: string) {
  const start = new Date(`${startDate}T00:00:00Z`).getTime()
  const end = new Date(`${endDate}T00:00:00Z`).getTime()
  return Math.max(0, Math.round((end - start) / 86400000))
}
