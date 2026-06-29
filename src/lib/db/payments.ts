import { createAdminSupabaseClient } from "@/lib/supabase-server"

export async function createPayment(input: {
  invoiceId: string
  provider: string
  providerOrderId: string
  amount: number
}) {
  const supabase = await createAdminSupabaseClient()
  const { data, error } = await supabase
    .from("payments")
    .insert({
      invoice_id: input.invoiceId,
      provider: input.provider,
      provider_order_id: input.providerOrderId,
      amount: input.amount,
      status: "PENDING",
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getPaymentByOrderId(orderId: string) {
  const supabase = await createAdminSupabaseClient()
  const { data } = await supabase.from("payments").select("*").eq("provider_order_id", orderId).single()
  return data
}

export async function updatePaymentStatus(id: string, status: string, transactionId?: string, rawCallback?: unknown) {
  const supabase = await createAdminSupabaseClient()
  const update: Record<string, unknown> = { status }
  if (transactionId) update.provider_transaction_id = transactionId
  if (rawCallback) update.raw_callback = rawCallback
  if (status === "PAID" || status === "settlement") {
    update.paid_at = new Date().toISOString()
  }
  const { error } = await supabase.from("payments").update(update).eq("id", id)
  if (error) throw error
}
