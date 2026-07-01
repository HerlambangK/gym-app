import { createAdminSupabaseClient } from "@/lib/supabase-server"

export async function getActiveSubscription(memberId: string) {
  const supabase = await createAdminSupabaseClient()
  const today = new Date().toISOString().split("T")[0]
  const { data } = await supabase
    .from("subscriptions")
    .select("*, membership_plans(*)")
    .eq("member_id", memberId)
    .eq("status", "ACTIVE")
    .lte("start_date", today)
    .gte("end_date", today)
    .order("start_date", { ascending: false })
    .limit(1)
    .maybeSingle()
  return data
}

export async function createSubscription(input: {
  memberId: string
  planId: string
  invoiceId: string
  startDate: string
  endDate: string
}) {
  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      member_id: input.memberId,
      plan_id: input.planId,
      invoice_id: input.invoiceId,
      start_date: input.startDate,
      end_date: input.endDate,
      status: "PENDING_PAYMENT",
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function activateSubscription(id: string) {
  const supabase = await createAdminSupabaseClient()
  const { data: subscription, error: readError } = await supabase
    .from("subscriptions")
    .select("id, member_id, membership_plans(code, type, duration_days)")
    .eq("id", id)
    .single()

  if (readError) throw readError

  const membershipPlans = subscription.membership_plans as { code?: string | null; type?: string | null; duration_days?: number | null } | Array<{ code?: string | null; type?: string | null; duration_days?: number | null }> | null
  const plan = Array.isArray(membershipPlans)
    ? membershipPlans[0]
    : membershipPlans
  const today = new Date().toISOString().split("T")[0]
  const { data: latestActiveSubscription } = await supabase
    .from("subscriptions")
    .select("end_date")
    .eq("member_id", subscription.member_id)
    .eq("status", "ACTIVE")
    .gte("end_date", today)
    .neq("id", id)
    .order("end_date", { ascending: false })
    .limit(1)
    .maybeSingle()
  const startDate = latestActiveSubscription?.end_date || today
  const endDate = addDaysFromDateString(startDate, Number(plan?.duration_days || 30))
  const memberType = plan?.code === "DAILY_PASS" || plan?.type === "DAILY" ? "DAILY" : "PREMIUM"

  const { error } = await supabase
    .from("subscriptions")
    .update({
      status: "ACTIVE",
      start_date: startDate,
      end_date: endDate,
    })
    .eq("id", id)

  if (error) throw error

  const { error: memberError } = await supabase
    .from("members")
    .update({
      status: "ACTIVE",
      member_type: memberType,
    })
    .eq("id", subscription.member_id)

  if (memberError) throw memberError
  return subscription
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
  const supabase = await createAdminSupabaseClient()
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (subscription) return activateSubscription(subscription.id)

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("member_id, plan_id, membership_plans(duration_days)")
    .eq("id", invoiceId)
    .single()

  if (invoiceError || !invoice) return null

  const membershipPlans = invoice.membership_plans as { duration_days?: number | null } | Array<{ duration_days?: number | null }> | null
  const durationDays = Array.isArray(membershipPlans)
    ? membershipPlans[0]?.duration_days
    : membershipPlans?.duration_days
  const startDate = new Date().toISOString().split("T")[0]

  const { data: createdSubscription, error: createError } = await supabase
    .from("subscriptions")
    .insert({
      member_id: invoice.member_id,
      plan_id: invoice.plan_id,
      invoice_id: invoiceId,
      start_date: startDate,
      end_date: addDays(new Date(), Number(durationDays || 30)),
      status: "ACTIVE",
    })
    .select("id")
    .single()

  if (createError || !createdSubscription) throw createError
  return activateSubscription(createdSubscription.id)
}

export async function updateSubscriptionStatusForInvoice(invoiceId: string, status: "PENDING_PAYMENT" | "EXPIRED" | "CANCELLED") {
  const supabase = await createAdminSupabaseClient()
  const { error } = await supabase
    .from("subscriptions")
    .update({ status })
    .eq("invoice_id", invoiceId)
    .neq("status", "ACTIVE")

  if (error) throw error
}

export async function getMemberSubscriptions(memberId: string) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase
    .from("subscriptions")
    .select("*, membership_plans(name, code)")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })
  return data || []
}

export async function getActiveSubscriptionCount() {
  const supabase = await createAdminSupabaseClient()
  const { count } = await supabase
    .from("subscriptions")
    .select("*", { count: "exact", head: true })
    .eq("status", "ACTIVE")
  return count || 0
}

export async function getExpiringSubscriptions(days = 7) {
  const supabase = await createAdminSupabaseClient()
  const today = new Date()
  const future = new Date(today.getTime() + days * 86400000).toISOString().split("T")[0]
  const { data } = await supabase
    .from("subscriptions")
    .select("*, members(users(name)), membership_plans(name)")
    .eq("status", "ACTIVE")
    .lte("end_date", future)
    .order("end_date")
  return data || []
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
  const supabase = await createAdminSupabaseClient()
  const today = new Date().toISOString().split("T")[0]
  const { data: all } = await supabase
    .from("subscriptions")
    .select("*, membership_plans(name, code, duration_days)")
    .eq("member_id", memberId)
    .eq("status", "ACTIVE")
    .order("start_date", { ascending: true })

  const current = (all || []).find((s) => s.start_date <= today && s.end_date >= today) || null
  const upcoming = (all || []).filter((s) => s.start_date > today)
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
