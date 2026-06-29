import { createAdminSupabaseClient } from "@/lib/supabase-server"

export async function getActiveSubscription(memberId: string) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase
    .from("subscriptions")
    .select("*, membership_plans(*)")
    .eq("member_id", memberId)
    .eq("status", "ACTIVE")
    .gte("end_date", new Date().toISOString().split("T")[0])
    .order("created_at", { ascending: false })
    .limit(1)
    .single()
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
  const { error } = await supabase.from("subscriptions").update({ status: "ACTIVE" }).eq("id", id)
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
