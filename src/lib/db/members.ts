import { eq, and, or, desc, count } from "drizzle-orm"
import { db } from "@/lib/drizzle"
import { members, users, subscriptions, membership_plans } from "@/db/schema"

export async function getMemberByUserId(userId: string) {
  const [data] = await db.select().from(members).where(eq(members.user_id, userId)).limit(1)
  return data || null
}

export async function getMembers(options?: { limit?: number; offset?: number; status?: string }) {
  const conditions: any[] = []
  if (options?.status) conditions.push(eq(members.status, options.status as any))

  const query = db
    .select()
    .from(members)
    .leftJoin(users, eq(members.user_id, users.id))
    .leftJoin(subscriptions, eq(members.id, subscriptions.member_id))
    .leftJoin(membership_plans, eq(subscriptions.plan_id, membership_plans.id))
    .orderBy(desc(members.created_at))

  const filtered = conditions.length > 0 ? query.where(and(...conditions)) : query

  const rows = await (options?.limit
    ? filtered.limit(options.limit).offset(options?.offset ?? 0)
    : filtered)

  const grouped = new Map<string, {
    id: string
    status: string
    member_type: string
    created_at: string
    users: { name: string | null; email: string | null; phone: string | null } | null
    subscriptions: { status: string | null; end_date: string | null; membership_plans: { name: string | null } | null } | null
  }>()

  for (const row of rows) {
    const memberId = row.members.id
    if (!grouped.has(memberId)) {
      grouped.set(memberId, {
        id: row.members.id,
        status: row.members.status,
        member_type: row.members.member_type,
        created_at: row.members.created_at,
        users: row.users ? { name: row.users.name, email: row.users.email, phone: row.users.phone } : null,
        subscriptions: null,
      })
    }
    if (row.subscriptions) {
      grouped.set(memberId, {
        ...grouped.get(memberId)!,
        subscriptions: {
          status: row.subscriptions.status,
          end_date: row.subscriptions.end_date,
          membership_plans: row.membership_plans ? { name: row.membership_plans.name } : null,
        },
      })
    }
  }

  return Array.from(grouped.values())
}

type MemberSubscriptionSummary = {
  status?: string | null
  end_date?: string | null
  membership_plans?: { name?: string | null } | Array<{ name?: string | null }> | null
}

function getPlanName(subscription?: MemberSubscriptionSummary | null) {
  const plan = Array.isArray(subscription?.membership_plans)
    ? subscription?.membership_plans[0]
    : subscription?.membership_plans
  return plan?.name || ""
}

export function getMemberSubscriptionSummary(member: Record<string, unknown>) {
  const subscriptionsList = Array.isArray(member.subscriptions)
    ? member.subscriptions as MemberSubscriptionSummary[]
    : []
  const activeSubscription = subscriptionsList.find((sub) => sub.status === "ACTIVE")
  const latestSubscription = activeSubscription || subscriptionsList[0]

  return {
    plan: getPlanName(latestSubscription) || (member.member_type as string | undefined) || "N/A",
    endDate: latestSubscription?.end_date || (member.created_at as string),
  }
}

export async function getMemberCount() {
  const [result] = await db.select({ value: count() }).from(members)
  return result?.value ?? 0
}

export async function createMember(userId: string, memberType: string, branchId?: string) {
  const [existing] = await db.select().from(members).where(eq(members.user_id, userId)).limit(1)
  if (existing) return existing

  const memberCode = `M-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  const [data] = await db
    .insert(members)
    .values({
      user_id: userId,
      member_code: memberCode,
      branch_id: branchId || null,
      member_type: memberType as any,
    })
    .returning()
  return data
}

export async function updateMemberStatus(memberId: string, status: string) {
  await db.update(members).set({ status: status as any }).where(eq(members.id, memberId))
}
