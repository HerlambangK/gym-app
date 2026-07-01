import { createAdminSupabaseClient } from "@/lib/supabase-server"

export async function getMemberByUserId(userId: string) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase.from("members").select("*").eq("user_id", userId).single()
  return data
}

export async function getMembers(options?: { limit?: number; offset?: number; status?: string }) {
  const supabase = await createAdminSupabaseClient()
  let query = supabase
    .from("members")
    .select("id, status, member_type, created_at, users(name, email, phone), subscriptions(status, end_date, membership_plans(name))")
    .order("created_at", { ascending: false })

  if (options?.status) query = query.eq("status", options.status)
  if (options?.limit) query = query.limit(options.limit)
  if (options?.offset) query = query.range(options.offset, (options.offset || 0) + (options.limit || 50) - 1)

  const { data } = await query
  return data || []
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
  const subscriptions = Array.isArray(member.subscriptions)
    ? member.subscriptions as MemberSubscriptionSummary[]
    : []
  const activeSubscription = subscriptions.find((subscription) => subscription.status === "ACTIVE")
  const latestSubscription = activeSubscription || subscriptions[0]

  return {
    plan: getPlanName(latestSubscription) || (member.member_type as string | undefined) || "N/A",
    endDate: latestSubscription?.end_date || (member.created_at as string),
  }
}

export async function getMemberCount() {
  const supabase = await createAdminSupabaseClient()
  const { count } = await supabase.from("members").select("*", { count: "exact", head: true })
  return count || 0
}

export async function createMember(userId: string, memberType: string, branchId?: string) {
  const supabase = await createAdminSupabaseClient()
  const memberCode = `M-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
  const { data, error } = await supabase
    .from("members")
    .insert({
      user_id: userId,
      member_code: memberCode,
      branch_id: branchId || null,
      member_type: memberType,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateMemberStatus(memberId: string, status: string) {
  const supabase = await createAdminSupabaseClient()
  const { error } = await supabase.from("members").update({ status }).eq("id", memberId)
  if (error) throw error
}
