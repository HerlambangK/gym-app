import { createAdminSupabaseClient } from "@/lib/supabase-server"

export async function createInvoice(input: {
  memberId: string
  planId: string
  amount: number
}) {
  const supabase = await createAdminSupabaseClient()
  const invoiceNumber = `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${Date.now().toString(36).toUpperCase()}`
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      member_id: input.memberId,
      plan_id: input.planId,
      amount: input.amount,
      status: "PENDING",
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getInvoiceByNumber(number: string) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase.from("invoices").select("*, members(*), membership_plans(*)").eq("invoice_number", number).single()
  return data
}

export async function getMemberInvoices(memberId: string) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase
    .from("invoices")
    .select("*, membership_plans(name, code)")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })
  return data || []
}

export async function getAllInvoices(options?: { limit?: number; offset?: number; status?: string }) {
  const supabase = await createAdminSupabaseClient()
  let query = supabase
    .from("invoices")
    .select("*, members(users(name)), membership_plans(name)")
    .order("created_at", { ascending: false })

  if (options?.status) query = query.eq("status", options.status)
  if (options?.limit) query = query.limit(options.limit)
  if (options?.offset) query = query.range(options.offset, (options.offset || 0) + (options.limit || 50) - 1)

  const { data } = await query
  return data || []
}

export async function updateInvoiceStatus(id: string, status: string) {
  const supabase = await createAdminSupabaseClient()
  const { error } = await supabase.from("invoices").update({ status }).eq("id", id)
  if (error) throw error
}

export async function getInvoiceStats() {
  const supabase = await createAdminSupabaseClient()
  const { data: paidInvoices } = await supabase
    .from("invoices")
    .select("amount")
    .eq("status", "PAID")
  const { data: pendingInvoices } = await supabase
    .from("invoices")
    .select("id")
    .eq("status", "PENDING")

  const totalRevenue = paidInvoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0
  return {
    totalRevenue,
    paidCount: paidInvoices?.length || 0,
    pendingCount: pendingInvoices?.length || 0,
  }
}
